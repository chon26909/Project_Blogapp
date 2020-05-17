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
    const { id }  = req.user;
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

    
    res.render("users/profile",{moment: moment, profile : result, Category : cat, moment : moment});
  });
  
  
  router.get("/mygallery", async function(req, res)
  {
    const { userid } = req.user;
    const result = await conPost.find({userid : userid});
    res.render("users/mygallery",{ moment: moment, photogallery : result});
  });
  
  router.post("/edit", upload_profile.single('imgprofile'), async function(req, res){
    let userid = req.user;
    console.log(req.file);

    if(req.file)
    {
      let n_name = req.body.username;
      let n_email = req.body.email;
      let n_imageprofile = req.file.filename;
      await conUser.updateMany({_id : userid},{$set: { username:n_name, email:n_email, image :n_imageprofile } });
      res.redirect("/user/me");
    }
    else
    {
      let n_name = req.body.username;
      let n_email = req.body.email;
      await conUser.updateMany({_id : userid},{$set: { username:n_name, email:n_email } });
      res.redirect("/user/me");
    }
  });
  
  router.get("/edit",middleware.checkAuthentication, async function(req, res)
  {
    res.render("users/Editprofile",{moment: moment});
  });

  module.exports = router;