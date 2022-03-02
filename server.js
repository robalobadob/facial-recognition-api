const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');

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

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            password: 'cookies',
            email: 'john@email.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            password: 'bananas',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'john@email.com'
        }
    ]
}

app.get('/', (req, res)=> {
    res.send(database.users);
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
    //bcryptjs -- to check a password
    // Load hash from your password DB.
    bcrypt.compare("cookies", '$2a$10$FROJTxXZDHe3DBMAi819kebeLDepAoxVQXx5clv.Qmjw41Vb8XvUa').then((res) => {
        console.log('first guess', res)
    });
    bcrypt.compare("not_bacon", '$2a$10$FROJTxXZDHe3DBMAi819kebeLDepAoxVQXx5clv.Qmjw41Vb8XvUa', function(err, res) {
        console.log('second guess', res)
    });
    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    }
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    // bcryptjs
    // to hash a password
    var bcrypt = require('bcryptjs');
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        console.log(hash);
    });
});
    db('users')
        .returning('*')
        .insert({
        email: email,
        name: name,
        joined: new Date()
    })
        .then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json('unable to register'))
})

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