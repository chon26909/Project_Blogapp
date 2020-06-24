var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var moment = require('moment');
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var methodOverride = require('method-override');
/*var LocalStrategy = require('passport-local');
var ConnectRoles = require('connect-roles');*/



var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.Connection;
var indexRouter = require('./routes/index');
var travelRouter = require('./routes/travel');
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');
var commentRouter = require('./routes/comment');

var app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

/*passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  // simulate an admin user
  obj.role = obj.username == 'admin' ? 'admin' : 'user';
  done(null, obj);
});*/

/*exports.read = function (req, res) {
  res.json(req.external);
};
exports.read = function (req, res) {
  //res.json(req.external);
  console.log(req.external);
  console.log('start----------');
  External.findById(req.external._id)
    .populate('user', 'displayName')
    .populate('articles')
    .exec(function (err, external) {
      console.log('in execution mode');
      if (err) {
        console.log('ERROR ERROR ERROR');
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        console.log('There is no error generated!');
        res.json(external);
      }
    });
};*/

/*var user = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    /*var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(user.middleware());

user.use(function(req, action){
  if(req.isAuthenticated() && action != 'access private page' && action != 'access admin page')
    return true;
});
user.use(function (req) {
  if (req.user.role === 'admin') {
    return true;
  }
});*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.get("*",function(req,res,next){
  res.locals.user = req.user || null;
  res.locals.MomentDate = Date.now();
  next();
})

// app.use(function(err, req, res, next){
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error');
// });

app.locals.description = function(text,lenght){
  //ส่งผลลัพธ์กลับไป
  //แสดงตั้งแต่ตัวที่ 0 จนถึง ความยาวที่กำหนด
  return text.substring(0,lenght);
}

app.use('/', indexRouter);
app.use('/travel', travelRouter);
app.use('/user', userRouter);
app.use('/comment/:id',commentRouter);
app.use('/admin',adminRouter);

/*app.get('/', user.can('access home page'), function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/admin', user.can('access admin page'), function (req, res) {
  res.render('admin');
});*/
port = process.env.PORT || 3000;
app.listen(port,function(req,res){
  console.log('started!');
});

module.exports = app;
