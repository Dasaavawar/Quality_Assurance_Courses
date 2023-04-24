'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');

const app = express();

// #1 - Set up a Template Engine
app.set('view engine', 'pug');
app.set('views', './views/pug');

// #3 - Set up Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// #13 - Clean Up Your Project with Modules
const routes = require('./routes.js');
const auth = require('./auth.js');

// #17 - Set up the Environment
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// #20 - Authentication with Socket.IO
const passportSocketIo = require('passport.socketio')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

// #5 - Implement the Serialization of a Passport User
myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  console.log("Successfully connected")

  routes(app, myDataBase);
  auth(app, myDataBase);

  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'express.sid',
      secret: process.env.SESSION_SECRET,
      store: store,
      success: onAuthorizeSuccess,
      fail: onAuthorizeFail
    })
  );

  // #18 - Communicate by Emitting
  let currentUsers = 0;
  io.on('connection', socket => {
    ++currentUsers;
    io.emit('user count', currentUsers);
    console.log('A user has connected');
    console.log('user ' + socket.request.user.username + ' connected');

    // #21 - Announce New Users
    io.emit('user', {
      username: socket.request.user.username,
      currentUsers,
      connected: true
    });

    // #22 - Send and Display Chat Messages
    socket.on('chat message', (message) => {
      io.emit('chat message', { username: socket.request.user.username, message });
    });

    // #19 - Handle a Disconnect
    socket.on('disconnect', () => {
      
      --currentUsers;
      io.emit('user count', currentUsers);
      console.log('A user has disconnected');
      
      io.emit('user', {
        username: socket.request.user.username,
        currentUsers,
        connected: false
      });
      
    });
    
  });
  
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}


const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
