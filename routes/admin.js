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

router.get("/",middleware.checkPermissionAdmin,async function(req,res)
{
    
  

   res.render("admin/addpanel");

});

router.get("/adminpanel",middleware.checkPermissionAdmin,async function(req,res)
{

  const user = await conUser.aggregate([{$lookup: {
    from: 'posts',
    localField: '_id',
    foreignField: 'author_by',
    as: 'totalpost'
  }}])
  res.render("admin/adminpanel",{title: "Manage Users", moment: moment, showallusers : user});

});


router.get("/addcatelog",middleware.checkPermissionAdmin,async function(req, res)
{
  const tag = req.query.keyword;
  const alltag = await conTag.find();
  
  
  console.log(alltag)
  res.render("admin/addcatelog",{title: "Add Tags" ,moment: moment, showtag : alltag, key : tag,});
});

router.post("/addTag",middleware.checkPermissionAdmin, async function(req, res)
{
  const new_tag = req.body.naw_tag;
  await conTag.create({name:new_tag});
  res.redirect("/admin/addcatelog");
})
router.get("/postofuser/:userid",middleware.checkPermissionAdmin,async function(req, res)
{
  const user = await conUser.findById(req.params.userid);
  const post = await conPost.find({ author_by :req.params.userid});
  
  res.render("admin/postofuser",{title: "PostOfUser", moment:moment, PostOfUser:post, Authorname : user.username});
})

module.exports = router;