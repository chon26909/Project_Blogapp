const express = require('express'),
      router = express.Router(),
      bodyParser = require('body-parser'),
      moment = require('moment'),
      middleware = require('../middleware'),
      conUser = require('../models/user'),
      conPost = require('../models/posts'),
      conCatelog = require('../models/categories');

//connect DB
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

//ย้ายรูปจาก form หน้า editprofile ไปเก็บในโฟลเดอร์ images/img-profile
var multer = require('multer');

var StorageOfimageprofile = multer.diskStorage(
  {
  destination:function(req,file,cb){
    cb(null,"./public/images/img-profile/");
  },
  filename:function(req,file,cb){
    //เก็บชื่อรูปต้นฉบับลงโฟลเดอร์
    cb(null,file.originalname);
  }
});
var upload_profile = multer({storage : StorageOfimageprofile});



router.get("/me",middleware.checkAuthentication, async function(req, res){

  const post = await conPost.find({ author_by :req.user});
  const category = await conCatelog.find();

    // const { id }  = req.user;
    // const result = await conUser.aggregate(
    // [
    //   {
    //     //select 
    //     $match: 
    //     { 
    //       _id : ObjectId(id)
    //     } 
    //   }
    //   , 
    //   {
    //     $lookup:
    //     {
    //       from: 'posts', //join กับ collection users 
    //       localField: '_id', 
    //       foreignField: 'userid',
    //       as: "post"
    //     }
    //   }
    // ]
    //   );
    res.render("users/profile",{title: "บทความของฉัน", moment: moment, post : post, category : category });
  });
  
router.get("/saved",middleware.checkAuthentication,async function(req,res)
{
  const savedpost = await conUser.findById(req.user._id).populate({path:'favourite',model: 'Post'});
  console.log(savedpost.favourite.length);
  res.render("users/favourite",{ title: "รายการที่บันทึกไว้", moment: moment, favouritePosts : savedpost});
})

  router.get("/mygallery", async function(req, res)
  {
    const { userid } = req.user;
    const result = await conPost.find({userid : userid});
    res.render("users/mygallery",{ moment: moment, photogallery : result});
  });
  
  router.post("/edit", upload_profile.single('imgprofile'), async function(req, res){
    let n_name = req.body.username;
    let n_email = req.body.email;
    let n_contact = 
    {
        facebook : req.body.facebook,
        line : req.body.line,
        phone : req.body.phone,
    };
    
    

    if(req.file)
    {
      let n_imageprofile = req.file.filename;
      let updateDataProfile = { username:n_name, email:n_email, image :n_imageprofile, contact:n_contact } 
      await conUser.findByIdAndUpdate(req.user,updateDataProfile);
      res.redirect("/user/me");
    }
    else
    {
      let updateDataProfile = { username:n_name, email:n_email, contact:n_contact } 
      await conUser.findByIdAndUpdate(req.user,updateDataProfile);
      res.redirect("/user/me");
    }
  });
  
  router.get("/edit",middleware.checkAuthentication, async function(req, res)
  {
    res.render("users/Editprofile",{ title: "แก้ไขข้อมูลส่วนตัว",moment: moment});
  });

  module.exports = router;