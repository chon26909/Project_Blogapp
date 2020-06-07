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

router.get("/",middleware.checkPermissionAdmin,function(req,res)
{
    res.render("adminpanel");
});

router.get("/me",function(req, res)
{
    res.send("Hello You are Admin")
})


router.get("/adminpanel",function(req,res)
{
    res.render("adminpanel");
});
router.get("/adminpost",function(req,res)
{
    res.render("adminpost");
});

module.exports = router;