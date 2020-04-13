var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/usermodel');
var { check, validationResult } = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
//DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Blog', {useNewUrlParser: true,useUnifiedTopology: true});
let PostSchema = new mongoose.Schema({
    userid: String,
    name: String,
    imgurl: String,
    desc: String
})
let conPost = mongoose.model("post",PostSchema);

/* GET users listing. */

//แสดงหน้าแรก ถ้า login แล้วจะแสดงอีกหน้านึ่ง
router.get('/',checkAuthentication, async function(req, res,) {
    const post_eat = await conPost.find({category: "ของกิน"}).limit(3);
    console.log(post_eat);
    res.render("index",{ post_eat : post_eat});
  });
  function checkAuthentication(req,res,next){
    if(req.isAuthenticated())
    {
        return next();
    } 
    else
    {
        return next();
    }
  }

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
    console.log(newUser);
    User.createUser(newUser,function(err){
      if(err) console.log(err);
      else
      {
        res.location('/blogs/');
        res.redirect('/blogs/login');
      }
    });
    
  }
});

router.get("/login", function(_req, res)
{
  res.render("login");
});

router.get("/logout", function(req, res)
{
  req.logout();
  res.redirect("/blogs");
});

router.post("/login", passport.authenticate('local',{
  failureRedirect:'/blogs/login',
  failureFlash:false
}),
function(req, res){
  res.redirect('/blogs');
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

router.get("/new", function(req, res){
    res.render("Addpost");
})
router.post("/new/id=:userid", function(req, res){
    let { userid } = req.params;
    console.log( userid );
    let n_name = req.body.name;
    let n_imgurl = req.body.imgurl;
    let n_desc = req.body.desc;
    let schema_post = {userid:userid ,name:n_name, imgurl:n_imgurl, desc:n_desc};
    conPost.create(schema_post,function(err,newdata){
        if(err){
            console.log(err);
        }
        else{
            console.log(newdata);
        }
    })
    res.redirect("/blogs");
});

router.get("/review/id=:id", async function(req, res)
{
    const { id } = req.params;
    const result = await conPost.findById(id);
    res.render("review",{ Blogs : result});
});


router.get("/test", async function(req, res)
{
    const product = await conPost.find();
    console.log(product);
    res.redirect('/blogs');
});

router.get("/profile/id=:id", async function(req, res){
  const { id } = req.params;
  const result = await conPost.find({userid : id});
  res.render("profile",{ photogallery : result});
});

router.get("/profile/edit/id=:id", async function(req, res){
  res.render("edit");
});

router.get("/mygallery/id=:id", async function(req, res){
  const { id } = req.params;
  const result = await conPost.find({userid : id});
  console.log(result);
  res.render("mygallery",{ photogallery : result});
});
module.exports = router;