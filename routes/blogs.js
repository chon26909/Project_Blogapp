var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment');

//ย้ายข้อมูลจาก form ไปเก็บในโฟลเดอร์
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
    const post = await conPost.find();
    
    const cat = await conCatelog.find();

    res.render("index",{ post_eat : post, Category : cat});
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
      //ค่าเริ่มต้นในการ register แล้วค่อยไปเพิ่มข้อมูลภายหลัง
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
  //ต่อมา
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

router.post("/new/id=:userid", upload.single('img_title') , async function(req, res){
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
            from: 'users', //join กับ collection users
            localField: 'userid', //ฟิลล์ใน posts
            foreignField: '_id', //ฟิลล์ใน users
            as: "postby" //เปลี่ยนชื่อ array ที่เก็บผลลัพธ์
          }
        }
      ]
      );

      const cat = await conCatelog.find();
      console.log(cat);
      res.render("review",{ Blogs : postreview , Category : cat});
});

// router.get("/test", async function(req, res)
// {
//     const product = await conPost.find();
//     console.log(product);
//     res.redirect('/blogs');
// });

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

// router.get("/upload",function(req, res)
// {
//   res.render("upload");
// });

router.post("/profile/edit/id=:userid",upload.single('pic'),async function(req, res){
  let { userid } = req.params;
  let n_image = req.file.originalname;
  let n_name = req.body.username;
  let n_email = req.body.email;
  // let update_user = conUser({username:n_name, image:n_image});
  // const complete = await schema_user.save();
  const data = await conUser.updateMany({_id : userid},{$set: { username:n_name, email:n_email, image:n_image}});
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
  console.log(post);
  res.render("showmore",{ posts : post});
})


module.exports = router;