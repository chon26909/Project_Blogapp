var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment');
var multer = require('multer');
var Storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./public/images/img-profile/") 
  },
  filename:function(req,file,cb){
    cb(null,file.originalname);
  }
});
var upload = multer({storage:Storage});



var passport = require('passport');
var User = require('../model/usermodel');
var { check, validationResult } = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
//DB
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});
let PostSchema = new mongoose.Schema({
    userid: ObjectId,
    name: String,
    category: String,
    imgurl: String,
    content: String,
    date: Date,
    comment: String,
    view: String,
})
let conPost = mongoose.model("post",PostSchema);

let UserSchema = new mongoose.Schema({
    username: String ,
    email: String ,
    password: String ,
    birthdate: Date ,
    image: String
})
let conUser = mongoose.model("users", UserSchema);

let CatelogSchema = new mongoose.Schema({
    name: String,
})
let conCatelog = mongoose.model("categories", CatelogSchema);

//แสดงหน้าแรก ถ้า login แล้วจะแสดงอีกหน้านึ่ง
router.get('/',checkAuthentication, async function(req, res,) {
    const post = await conPost.find();
    const userid = post.userid;
    const user = await conUser.findById(userid);
    
    res.render("index",{ post_eat : post, byuser : user});
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
        password:password,
        image: "no-imgprofile.png"
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
  // ไม่สำเสร็จ
  failureRedirect:'/blogs/login',
  failureFlash:false
}),
function(req, res)
{
  // สำเร็จ
  res.redirect('/blogs');
});

passport.serializeUser(function(user,done)
{
  done(null,user.id);
});

passport.deserializeUser(function(id,done)
{
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
          //return ออกไปเก็บ session
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

router.get("/new",async function(req, res){
  const cat = await conCatelog.find();
  console.log(cat);
  res.render("Addpost",{ categories:cat });
})

router.post("/new/id=:userid", upload.single('img_title') , async function(req, res){
    let { userid } = req.params;
    let n_name = req.body.name;
    let n_category = req.body.category;
    let n_imgurl = req.file.originalname;
    let n_desc = req.body.desc;
    let n_content = req.body.editor;
    let n_date = new Date().toLocaleString("en-US",{ timeZone: "Asia/Bangkok"});
    console.log(n_date);
    await conPost.create({userid:userid ,name:n_name, category:n_category , imgurl:n_imgurl, desc:n_desc, content:n_content, date:n_date});
    res.redirect("/blogs");
});

router.get("/review/id=:id", async function(req, res)
{
    const { id } = req.params;
    // const post = await conPost.findById(id);

    // const userid = post.userid;
    // const user = await conUser.findById(userid);

    const postreview = await conPost.aggregate(
      [
        {
          //select with condition
          $match: 
          { 
            _id : ObjectId(id)
          } 
        }
        , 
        {
          $lookup:
          {
            from: 'users', //join กับ collection users
            localField: 'userid', 
            foreignField: '_id',
            as: "postby"
          }
        }
      ]
      );
      console.log(postreview);
      res.render("review",{ Blogs : postreview });
});

router.get("/test", async function(req, res)
{
    const product = await conPost.find();
    console.log(product);
    res.redirect('/blogs');
});

router.get("/profile/id=:id", async function(req, res){
  const { id } = req.params;
  const result = await conUser.aggregate(
  [
    {
      //select 
      $match: 
      { 
        _id : ObjectId(id)
      } 
    }
    , 
    {
      $lookup:
      {
        from: 'posts', //join กับ collection users 
        localField: '_id', 
        foreignField: 'userid',
        as: "post"
      }
    }
  ]
    );
  console.log(result);
  res.render("profile",{ profile : result});
});


router.get("/mygallery/id=:id", async function(req, res)
{
  const { id } = req.params;
  const result = await conPost.find({userid : id});
  console.log(result);
  res.render("mygallery",{ photogallery : result});
});

router.get("/upload",function(req, res)
{
  res.render("upload");
});

router.post("/profile/edit/id=:userid",upload.single('pic'),async function(req, res){
  let { userid } = req.params;
  let n_image = req.file.originalname;
  let n_name = req.body.username;
  let n_email = req.body.email;
  // let update_user = conUser({username:n_name, image:n_image});
  // const complete = await schema_user.save();
  const data = await conUser.updateMany({_id:userid},{$set:{username:n_name,email:n_email,image:n_image}});
  res.redirect("/blogs");
});

router.get("/profile/edit/id=:id", async function(req, res)
{
  res.render("edit");
});

router.get("/showmore/:name", async function(req, res){
  let { name } = req.params;
  const post = await conPost.find({ category : name });
  // const userid = post.userid;
  // const user = await conUser.findById(userid);
    
  res.render("showmore",{ posts : post});
})

router.get("/chon", async function(req, res){
  var chon = await conPost.aggregate(
    [
      {$match: 
        {
          _id: ObjectId('5e96d9f398f25299e4e6bb7d')
        }
      }, 
      {$lookup: 
        {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: "postby"
        }
      }
    ]
    );
  res.json(chon);
})

module.exports = router;