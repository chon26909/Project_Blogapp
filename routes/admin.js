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
const ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

router.get("/",async function(req,res)
{
     //const showusers = await conUser.find();
   //console.log(showusers )
   //res.render("admin/adduser",{ moment: moment, showallusers : showusers});
 // }
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
  res.render("admin/adminpanel",{ moment: moment, showallusers : showusers});
   
    //res.render("admin/adminpanel");
});

router.get("/adminpost",async function(req,res)
{
  
    const { userid } = req.admin;
    const result = await conPost.find({userid : userid});
    res.render("admin/adminpost",{ moment: moment, photogallery : result});

  
    //res.render("admin/adminpost");
});

/*router.get("/addcatelog",function(req,res)
{
    res.render("admin/addcatelog");
});

router.get('/edit/:id', (req,res, next)=>{
    console.log(req.params.id);
        club.findOneAndUpdate({_id: req.params.id}, req.body, {new:true},(err,docs)=>{
            if(err){
              console.log("Can't retrive data and edit because of some database problem");
            }else{
        res.render('edit');

    }
  })
});*/

router.get("/addcatelog",async function(req, res)
{
  const alltag = await conTag.find();
  console.log(alltag)
  res.render("admin/addcatelog",{moment: moment, showtag : alltag});
});


module.exports = router;