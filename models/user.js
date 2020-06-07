/*var express = require('express');

var LocalStrategy = require('passport-local');
var ConnectRoles = require('connect-roles');*/
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocalMongoose = require("passport-local-mongoose");
var LocalStrategy = require('passport-local').Strategy;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console,'Connection Error'));

/*var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: {type: Boolean, default: false}
});*/

/*userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("user",userSchema);*/
//schema table ใน DB
var userSchema = mongoose.Schema({
    username: String ,
    email: String ,
    password: String ,
    birthdate: Date ,
    image: String,
    contact:{
      facebook: String,
      line: String,
      phone: String
    },
    permission: String,
    favourite:
    [   
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }   
    ]
  
});
//export model ไปใช้ router ชื่อ users
var User = module.exports = mongoose.model('User',userSchema);

//หน้า register ก่อนที่บันทึก password ต้อง bcrypt ซะก่อน 
module.exports.createUser = function(newUser, callback)
{
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save(callback);
        });
    }); 
}

module.exports.getUserById = function(id,callback)
{
    User.findById(id,callback);
}

module.exports.getUserByEmail = function(email,callback)
{
    var query = { email : email };
    User.findOne(query,callback);
}

// module.exports.resetPassword = function(email, result)
// {
//   const result = User.find({email: email});
// }


/*passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  // simulate an admin user
  obj.role = obj.username == 'admin' ? 'admin' : 'user';
  done(null, obj);
});*/


module.exports.comparePassword = function(password,hash,callback)
{
    bcrypt.compare(password,hash,function(err,isMatch){
        callback(null,isMatch)
    });
}

passport.serializeUser(function(user,done)
{
  done(null,user.id);
});

passport.deserializeUser(function(id,done)
{
  //User อันนี้ เป็น module ที่ export ออกมาจาก /model/usermodel.js แล้วเข้าไปใช้งาน method ชื่อว่า getUserById
  User.getUserById(id,function(err,username)
  {
    done(err,username)
  })
});

passport.use(new LocalStrategy(function(email,password,done)
{
  //ค้นหาด้วย email 
  User.getUserByEmail(email,function(err,user){
    //ส่งข้อมูล user กลับมา
    if(err) throw errors
    if(!user)
    {
      //อีเมลไม่ถูกต้อง ไม่พบผู้ใช้
      return done(null,false)
    }
    else
    { 
      //อีเมลล์ถูกค้อง แล้วค่อยเปรียบเทียบ password
      User.comparePassword(password,user.password,function(err,isMatch)
      {
        if(isMatch)
        {
          //รหัสผ่านถูกต้อง
          //return ออกไปเก็บ session ตัวแปร locals.user สามารถเรียกใช้งานได้ทั้งระบบ
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