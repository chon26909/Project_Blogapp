const express = require('express'),
      router = express.Router(),
      bodyParser = require('body-parser'),
      moment = require('moment'),
      multer = require('multer'),
      middleware = require('../middleware'),
      conUser = require('../models/user'),
      conPost = require('../models/posts'),
      conCatelog = require('../models/categories'),
      conTag = require('../models/tag'),
      comment = require('../models/comment');


//connect DB
const mongoose = require('mongoose');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { nextTick } = require('process');
const ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

router.get("/",async function(req,res)
{
     //const showusers = await conUser.find();
   //console.log(showusers )
   //res.render("admin/adduser",{ moment: moment, showallusers : showusers});
 // }

   //res.render("admin/addpanel",);
  

   res.render("admin/addpanel");

});

router.get("/me",function(req, res)
{
    res.send("Hello You are Admin")
})


router.get("/adminpanel",async function(req,res)
{
  const showusers = await conUser.find();
  console.log(showusers )
  res.render("admin/adminpanel",{title: "Manage Users", moment: moment, showallusers : showusers});
   
    //res.render("admin/adminpanel");
});

router.get("/adminpost",async function(req,res)
{
// <<<<<<< HEAD
    res.render("admin/adminpost");
// =======
  
    const { userid } = req.admin;
    const result = await conPost.find({userid : userid});
    res.render("admin/adminpost",{ moment: moment, photogallery : result});

  
    //res.render("admin/adminpost");
// >>>>>>> ff220060dd22b5afe25994ccdf78e86692b95adc
});




router.get("/addcatelog",async function(req, res)
{
  const tag = req.query.keyword;
  const alltag = await conTag.find();
  
  
  console.log(alltag)
  res.render("admin/addcatelog",{title: "Add Tags" ,moment: moment, showtag : alltag, key : tag,});
});


router.get("/Alluser",async function(req, res)
{
  const user = await conUser.aggregate([{$lookup: {
    from: 'posts',
    localField: '_id',
    foreignField: 'author_by',
    as: 'totalpost'
  }}])
  console.log(user);
  res.render("admin/postofuser",{title: "PostOfUser", moment:moment, user:user});
})

module.exports = router;