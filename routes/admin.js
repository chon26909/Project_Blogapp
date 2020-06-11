const express = require('express'),
      router = express.Router(),
      bodyParser = require('body-parser'),
      moment = require('moment'),
      multer = require('multer'),
      middleware = require('../middleware'),
      conUser = require('../models/user'),
      conPost = require('../models/posts'),
      conCatelog = require('../models/categories'),
      comment = require('../models/comment');

//connect DB
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

router.get("/",async function(req,res)
{
     const showusers = await conUser.find();
     //const users = await conUser.find();
  // console.log(users.adminpanel.length);
  //for (var i = 1; i <= 10; i++) 
  //{
   //  console.table(users,["id","name"]);

   console.log(showusers )
   res.render("admin/adduser",{ moment: moment, showallusers : showusers});
 // }
  // res.render("admin/adminpanel");
  
});

router.get("/me",function(req, res)
{
    res.send("Hello You are Admin")
})


router.get("/adduser",function(req,res)
{
    res.render("admin/adduser");
});
router.get("/adminpost",function(req,res)
{
    res.render("adminpost");
});

module.exports = router;