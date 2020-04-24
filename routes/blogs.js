var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment');

//ย้ายรูปจาก form หน้า editprofile ไปเก็บในโฟลเดอร์ images/img-profile
var multer = require('multer');
var StorageOfimageprofile = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./public/images/img-profile/")
  },
  filename:function(req,file,cb){
    //เก็บชื่อรูปต้นฉบับลงโฟลเดอร์
    cb(null,file.originalname);
  }
});
var upload_profile = multer({storage : StorageOfimageprofile});

//ย้ายรูปจาก form หน้า editprofile ไปเก็บในโฟลเดอร์ images/posts
var StorageOfimagepost = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./public/images/posts/")
  },
  filename:function(req,file,cb){
    //เปลี่ยนชื่อรูปก่อนเก็บลงโฟลเดอร์
    cb(null,file.originalname);
  }
});
var upload_imgpost = multer({storage : StorageOfimagepost});


//passport login
var passport = require('passport');
//import model เข้ามาใช้แค่ในระบบ login
var User = require('../model/usermodel');
//ตรวจข้อมูลและการแจ้งข้อผิดพลาด ใช้ในการหน้า register
var { check, validationResult } = require('express-validator');
//login 
var LocalStrategy = require('passport-local').Strategy;
//connect DB
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;
//URL Mongo Cloud
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});
//รูปแบบ schema ของ posts
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

//รูปแบบ schema ของ users
let UserSchema = new mongoose.Schema({
    username: String ,
    email: String ,
    password: String ,
    birthdate: Date ,
    image: String
})
let conUser = mongoose.model("users", UserSchema);

//รูปแบบ schema ของ categories
let CatelogSchema = new mongoose.Schema({
    name: String,
})
let conCatelog = mongoose.model("categories", CatelogSchema);

//แสดงหน้าแรก ถ้า login แล้วจะแสดงอีกหน้านึ่ง
router.get('/',checkAuthentication, async function(req, res,) {
  //ไปดึงข้อมูล posts มาแสดงหน้าแรก
    const songkran_post = await conPost.find({category : "เที่ยวสงกรานต์"});

    const market_post = await conPost.find({category:"ตลาดกลางคืน"});
    
    const marketfloat_post = await conPost.find({category : "ตลาดน้ำ"});
    
    const cat = await conCatelog.find();

    res.render("index",{ post_eat : songkran_post, Marketfloat : marketfloat_post, Category : cat});
  });


  function checkAuthentication(req,res,next){
    //ตรวจสอบว่า login แล้วหรือยัง
    if(req.isAuthenticated())
    {
      //ถ้า login แล้ว ให้ next() คือ res.render("index") ออกไปเลย
      return next();
    } 
    else
    {
      //กรณีถ้ายังไม่ login จะ redirect ไปหน้าไหนก่อน
      //next() -> เข้าหน้าแรกได้เลย ไม่loginก็ได้
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
  check("password","กรุณาป้อนรหัสผ่าน").not().isEmpty(),
  check("password2","กรุณายืนยันรหัสผ่าน").not().isEmpty()
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
      let username = req.body.username;
      let email = req.body.email;
      let password = req.body.password;
      let password2 = req.body.password2;

      //ค่าเริ่มต้นในการ register แล้วค่อยไปเพิ่มข้อมูลอื่นๆ ในภายหลัง
      var newUser = new User
      ({
        username:username,
        email:email,
        password:password,
        image: "no-imgprofile.png"
      })
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
  //ทำลาย session ทิ้ง
  req.logout();
  res.redirect("/blogs");
});

router.post("/login", passport.authenticate('local',{
  // ถ้าไม่สำเสร็จให้ไปที่หน้า /blogs/login
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
  //User อันนี้ เป็น module ที่ export ออกมาจาก /model/usermodel.js แล้วเข้าไปใช้งาน method ชื่อว่า getUserById
  User.getUserById(id,function(err,username)
  {
    done(err,username)
  })
});

passport.use(new LocalStrategy(function(email,password,done){
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

router.get("/new",async function(req, res)
{
  const cat = await conCatelog.find();
  res.render("Addpost",{ categories : cat });
})

router.post("/new/id=:userid", upload_imgpost.single('img_title') , async function(req, res){
    //ส่ง img_title 
    let { userid } = req.params;
    let n_name = req.body.name;
    let n_category = req.body.category;
    let n_imgurl = req.file.originalname;
    let n_desc = req.body.desc;
    let n_content = req.body.editor;
    let n_date = new Date();
    await conPost.create({userid:userid ,name:n_name, category:n_category , imgurl:n_imgurl, desc:n_desc, content:n_content, date:n_date});
    res.redirect("/blogs");
});

router.get("/review/:id", async function(req, res)
{
    //การ join ระหว่าง collection 
    //userid ใน posts join กับ _id ใน users
    const { id } = req.params;
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
            from: 'users', //join กับ collection ชื่อ users
            localField: 'userid', //ฟิลล์ใน posts
            foreignField: '_id', //ฟิลล์ใน users
            as: "postby" //เปลี่ยนชื่อ array ที่เก็บผลลัพธ์
          }
        }
      ]
      );

      const cat = await conCatelog.find();
      res.render("review",{ Blogs : postreview , Category : cat, moment : moment});
});

router.get("/edit/:postid",async function(req, res){
  const { postid } = req.params;
  const Editpost = await conPost.findById(postid);
  const cat = await conCatelog.find();
  res.render("Editpost", { post : Editpost, categories : cat });
});

router.post("/edit/:postid", upload_imgpost.single('img_title'), async function(req,res){

  let { postid } = req.params;

  //ถ้ามีการอัพเดตรูปภาพ
  if(req.file)
  { 
    //ส่งรูปไปเก็บในโฟลเดอร์
    let n_name = req.body.name;
    let n_category = req.body.category;
    let n_imgurl = req.file.filename;
    let n_content = req.body.editor;
    let n_date = new Date();
    let data = await conPost.updateMany({_id : postid},{$set: {name:n_name, category:n_category , imgurl : n_imgurl, content:n_content, date:n_date}});
    res.redirect("/blogs/review/" + postid);
  }
  else
  {
    let n_name = req.body.name;
    let n_category = req.body.category;
    let n_content = req.body.editor;
    let n_date = new Date();
    let data = await conPost.updateMany({_id : postid},{$set: {name:n_name, category:n_category, content:n_content, date:n_date}});
    res.redirect("/blogs/review/" + postid);
  }  
});

router.get("/delete/:postid",async function(req, res){
  const { postid } = req.params;
  console.log(postid);
  await conPost.remove({ _id:postid });
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
  const cat = await conCatelog.find();
  res.render("profile",{ profile : result, Category : cat, moment : moment});
});


router.get("/mygallery/id=:id", async function(req, res)
{
  const { id } = req.params;
  const result = await conPost.find({userid : id});
  res.render("mygallery",{ photogallery : result});
});

router.post("/profile/edit/id=:userid", upload_profile.single('imgprofile'), async function(req, res){
  let { userid } = req.params;

  if(req.file)
  {
    let n_name = req.body.username;
    let n_email = req.body.email;
    let n_imageprofile = req.file.filename;
    await conUser.updateMany({_id : userid},{$set: { username:n_name, email:n_email, image :n_imageprofile } });
    res.redirect("/blogs/profile/id=" + userid);
  }
  else
  {
    let n_name = req.body.username;
    let n_email = req.body.email;
    await conUser.updateMany({_id : userid},{$set: { username:n_name, email:n_email } });
    res.redirect("/blogs/profile/id=" + userid);
  }
});

router.get("/profile/edit/id=:id", async function(req, res)
{
  res.render("Editprofile");
});

router.get("/showmore/:name", async function(req, res){
  let { name } = req.params;
  const post = await conPost.find({ category : name });

  res.render("showmore",{ posts : post});
})


module.exports = router;