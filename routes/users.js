var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Blog', {useNewUrlParser: true,useUnifiedTopology: true});
var User = require('../model/usermodel');

var { check, validationResult } = require('express-validator');
/* GET users listing. */
router.get('/', function(_req, res) 
{
  res.send('respond with a resource');
});

router.get("/register", function(_req, res)
{
  res.render("register");
});

router.post("/register",[
  check("username","กรุณาป้อนชื่อผู้ใช้").not().isEmpty(),
  check("email","กรุณาป้อนอีเมล").isEmail(),
  check("password","กรุณาป้อนรหัสผ่าน").not().isEmpty()
] ,function(req, res)
{
  const result = validationResult(req);
  var errors = result.errors;
  if(!result.isEmpty())
  {
    //return to page
    res.render("register", { errors : errors });
  }
  else
  {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var newUser = new User
    ({
      username:username,
      email:email,
      password:password
    })

    User.createUser(newUser,function(err,user){
      if(err) throw err
    });
    res.location('/users/login');
    res.redirect('/users/login');
  }
});

router.get("/login", function(_req, res)
{
  res.render("login");
});

router.get("/logout", function(req, res)
{
  req.logout();
  res.redirect("/index");
});

router.post("/login", passport.authenticate('local',{
  failureRedirect:'/users/login',
  failureFlash:false
}),
function(req, res){
  res.redirect('/index');
});

passport.serializeUser(function(user,done){
  done(null,user.id);
  //ลงชื่อเข้าใช้สำเร็จ
});

passport.deserializeUser(function(id,done){
  //ต่อมา
  User.getUserById(id,function(err,username){
    done(err,username);
  })
});

passport.use(new LocalStrategy(function(username,password,done){
  User.getUserByName(username,function(err,user){
    if(err) throw errors
    //กรณีที่ว่า ชื่อผู้ใช้เดียวกัน แต่อีเมล รหัสผ่านต่างกัน
    if(!user){
      //ไม่พบผู้ใช้
      return done(null,false)
    }
    else
    { 
      console.log(user.password);
      console.log(password);
      User.comparePassword(password,user.password,function(err,isMatch){
        if(isMatch)
        {
          console.log(user);
          return done(null,user);
        }
        else
        {
          return done(null,false)
        }
        
      })
      
      //ส่งไปหา passport.serializeUser
    }
  });
  

}));

module.exports = router;