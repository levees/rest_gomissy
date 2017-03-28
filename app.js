'use strict';

/*
 * Notification Push Server : nodejs, express, mongodb
 * Copyright(c) 2017 CDNetworks Bryan.Oh <bryan.oh@cdnetworks.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const models = join(__dirname, 'app/models');
const config = require('./config');
const port = process.env.PORT || 3000;
const app = express();

const secret = 'yourSuperSecretPassword'

// Expose
module.exports = app;

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen () {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect(config.db, options).connection;
}





//  var express = require('express')
//   , http = require('http')
//   , bodyParser = require('body-parser')
//   , logger = require('morgan')
//   , cors = require('cors')
//   , jwt = require('jsonwebtoken')
//   , mongoose = require('mongoose')
//   , passport = require('passport')
//   , ldapStrategy = require('passport-ldapauth').Strategy
//   , basicAuth = require('basic-auth')


// // mongoose.connect('mongodb://localhost/myappdatabase');
// // mongoose.connect('mongodb://jamie:1q2w3e4r@ds139187.mlab.com:39187/heroku_v1hnggq0');



// var ldap_options = {
//   server: {
//     url: 'ldap://kdc3.cdnetworks.kr:3268',
//     bindDn: 'CN=fmslog_ldap,OU=System Account,OU=CDNetworks,dc=cdnetworks,dc=kr',
//     bindCredentials: 'Fms#$admin',
//     searchBase: 'dc=cdnetworks,dc=kr',
//     searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
//     // searchAttributes: ['userPrincipalName']
//   },
//   usernameField: 'username',
//   passwordField: 'password'
// };


// // if our user.js file is at app/models/user.js
// var User = require('./models/User');

// //create a new user called chris
// // var chris = new User({
// //   name: 'ChrisXX',
// //   username: 'sevilayhaxx',
// //   password: 'password'
// // });


// // var jamie = new User({
// //   name: 'jamieXX',
// //   username: 'jamiexx',
// //   password: 'password'
// // });

// // // call the custom method. this will just add -dude to his name
// // // user will now be Chris-dude
// // chris.dudify(function(err, name) {
// //   if (err) throw err;
// //
// //   console.log('Your new name is ' + name);
// // });

// // call the built-in save method to save to the database
// //
// // jamie.save(function(err) {
// //   if (err) throw err;
// //
// //   console.log('user: jamie added');
// // });
// //
// // chris.save(function(err) {
// //   if (err) throw err;
// //
// //   console.log('User saved successfully!');
// // });


// var secret = 'yourSuperSecretPassword'
// var app = express();


// passport.use(new ldapStrategy(ldap_options));

// app.set('port', process.env.PORT || 3000);
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors());

// app.use(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header('Access-Control-Allow-Methods', 'POST, GET, UPDATE, DELETE, PUT');
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });


// // app.use(passport.initialize());

// app.post('/login', passport.authenticate('ldapauth', {session: false}), function(req, res) {
//   console.log(req.user);
//   res.send({status: 'ok'});
// });





// // get
// app.get('/users', function(req, res) {


//   User.find({}, function(err, users) {
//     if (err) throw err;

//     // object of all the users
//     console.log(users);
//   });


// });


// // get on

// app.get('/user', function(req, res) {

//   // get the user starlord55
//   User.find({ username: 'starlord55' }, function(err, user) {
//     if (err) throw err;

//     // object of the user
//     console.log(user);
//   });


//   // get a user with ID of 1
//   User.findById('5814bc3a0141450d918755da', function(err, user) {
//     if (err) throw err;

//     // show the one user
//     console.log(user);
//   });

// });




// // handle Ionic Auth
// app.get('/auth', function(req, res){

//     // verify the incoming JWT

//     try {
//       var incomingToken = jwt.verify(req.query.token, secret);
//     } catch (ex) {
//       console.error(ex.stack);
//       return res.status(401).send('jwt error');
//     }

//     // do whatever auth stuff you want with the users details

//     var email = incomingToken.data.email;
//     var password = incomingToken.data.password;
//     var user_id;

//     console.log(email, password);
//     // if(email == 'me@test.com' && password == 'password'){
//     //
//     //     // user authentication was successful, assign whatever data you want
//     //     user_id = '123';
//     //     console.log('Authenticated now...');
//     // }

//     // get the user starlord55
//     User.find({ username: email, password: password }, function(err, user) {
//       if (err) throw err;

//       // object of the user
//       console.log(user);
//       console.log('Authentiated...');

//       //var user_id = '12345678';
//       var outgoingTokenPayload = {
//         "user_id": "1234567890",
//         "custom": {
//           "marital_status": "single",
//           "language": "en"
//         }
//       };
//       //var email = email;

//       var outgoingToken = jwt.sign(outgoingTokenPayload, secret);
//       var url = req.query.redirect_uri +
//           '&token=' + encodeURIComponent(outgoingToken) +
//           '&state=' + encodeURIComponent(req.query.state);


//       //return res;
//       return res.redirect(url);
//     });


//     // construct JWT and redirect to the redirect_uri



// });

// app.listen(app.get('port'));
// console.log("App listening on " + app.get('port'));


