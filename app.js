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

const port = process.env.port || 3000;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.Connection;
var indexRouter = require('./routes/index');
var blogRouter = require('./routes/blogs');
var adminRouter = require('./routes/admin');

var app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

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
  next();
})

app.use(function(err, req, res, next){
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.locals.description = function(text,lenght){
  //ส่งผลลัพธ์กลับไป
  //แสดงตั้งแต่ตัวที่ 0 จนถึง ความยาวที่กำหนด
  return text.substring(0,lenght);
}

app.use('/', indexRouter);
app.use('/blogs', blogRouter);
app.use('/admin',adminRouter);
module.exports = app;