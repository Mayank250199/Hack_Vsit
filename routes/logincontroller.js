var mongoose = require('mongoose');
var express = require('express');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var passport = require('passport');
var session = require('express-session');
var Recaptcha = require('recaptcha-verify');

var recaptcha = new Recaptcha({
    secret: '6LelzCkUAAAAAEC_24Mr-ILrFLkqJy7ELG3L3-7G',
    verbose: true
});

mongoose.Promise = global.Promise;

var go = express();

//include files from models folder
var User = require('../models/user');




//Connect to the database
mongoose.connect('mongodb://help_ops:help@ds133249.mlab.com:33249/help_ops');
var db = mongoose.connection;

// Input data in database
  go.post('/signup', function(req,res){
  var  FirstName = req.body.FirstName;
  var  LastName  = req.body.LastName;
  var  Username  = req.body.Username;
  var  Password  = req.body.Password;
  var  ConfirmPassword = req.body.ConfirmPassword;
  var  Gender  = req.body.Gender;

  // Validation
  req.checkBody('FirstName','Type a valid FirstName with no space and no special characters').isAlpha();
  req.checkBody('LastName' ,'Type a valid LastName with no space and no special characters').isAlpha();
	req.checkBody('Username' ,'Email is not Valid').isEmail();
  req.check("Password", "Password should not less than 8 characters").matches(/^\w{8,30}$/);
  req.checkBody('ConfirmPassword' ,'Passwords do not match').equals(req.body.Password);
  req.checkBody('Gender' ,'Gender is not Empty').notEmpty();


 var userResponse = req.body['g-recaptcha-response'];



    var error = req.validationErrors();

    recaptcha.checkResponse(userResponse, function(errors, response){
            if(errors){
                // an internal error?
                req.flash('error_msg', 'Bad Request!! Try again ');
                  res.redirect('/signup');
                return;
            }
            if(response.success){
              if(error){

              res.render("signup",{
                error:error
              });
                }
                else{
              var newUser = new User({
                    FirstName : FirstName,
                    LastName  : LastName,
                    Username  : Username,
                    Password  : Password,
                    Gender    : Gender
                   });

              // create users
                 User.createUser(newUser, function(err, user){
                   if(err) throw err;
                   console.log(user);

                });

                req.flash('success_msg', 'You are sign up and you can  login now');

                res.redirect('/login');
              }
                // save session.. create user.. save form data.. render page, return json.. etc.
            }else{
              if(error){

              res.render("signup",{
                error:error
              });
            }else{
                req.flash('error_msg', 'Verify You are not a robot ');
                res.redirect('/signup');
              }
            }
        });


             // save session.. create user.. save form data.. render page, return json.. etc.



});






// authentication
go.post('/login',function(req,res){
  User.findOne( {Username:req.body.Username},function(err,user){
if(!user)
{    req.flash('success_msg', 'Unknown User');
  res.redirect('login');
  }
else{
  User.comparePassword(req.body.Password, user.Password, function(err, isMatch){
    if(err) throw err;
    if(isMatch){
      req.session.authenticated = true;
      var name=user.FirstName;
      	res.render('userloggedin',{ name: name});

    } else {
        req.flash('error_msg', 'Invalid Password');
      res.redirect('login');
    }
  });

}
  });
  });
  // Authentication and Authorization Middleware
  var auth = function(req, res, next) {
    if (req.session && req.session.user === "amy" && req.session.admin)
      return next();
    else
      return res.sendStatus(401);
  };

  // Get content endpoint
go.get('/content', auth, function (req, res) {
   res.send("You can only see this after you've logged in.");
});

  go.get('/logout', function(req, res){

delete req.session.authenticated;
  req.flash('success_msg',"You are logged out");
  	res.redirect('/login');
  });

// home
go.get('/', function(req, res){
	res.render('home');
});

//signup
go.get('/signup', function(req, res){
	res.render('signup');
});

go.get('/home', function(req, res){
	res.render('home');
});

//notesview
go.get('/notesview', function(req, res){
	res.render('notesview');
});

go.get('/login', function(req, res){
		res.render('login');
});
go.get('/adminlogin', function(req, res){
		res.render('adminlogin');
});
go.get('/about', function(req, res){
		res.render('about');
});

module.exports = go;
