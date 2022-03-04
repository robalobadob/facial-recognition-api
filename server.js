const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register')

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'robhoover',
      password : '',
      database : 'smart-brain'
    }
  });

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get('/', (req, res)=> {
    res.send('success');
})

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.get('/products/:id', function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for all origins!'})
  })
   
app.listen(80, function () {
console.log('CORS-enabled web server listening on port 80')
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    db.select('*').from('users').where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not Found')
            }
        })
        .catch(err => res.status(400).json('Error Getting User'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries)
    })
    .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(3000, () => {
    console.log('app is running on port 3000');
})