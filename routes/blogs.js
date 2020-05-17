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

//แสดงหน้าแรก ถ้า login แล้วจะแสดงอีกหน้านึ่ง
router.get('/', async function(req, res,) {
  //ไปดึงข้อมูล posts มาแสดงหน้าแรก
    const songkran_post = await conPost.find({category : "เที่ยวสงกรานต์"}).limit(4);

    const market_post = await conPost.find({category: "ตลาดกลางคืน"});
    
    const marketfloat_post = await conPost.find({category : "ตลาดน้ำ"});
    
    const cat = await conCatelog.find();

    res.render("blogs/index",{ moment: moment, section1 : songkran_post, Marketfloat : marketfloat_post, Category : cat });
});

router.get("/new",middleware.checkAuthentication,async function(req, res)
{
  const cat = await conCatelog.find();
  res.render("blogs/Addpost",{ moment: moment, categories : cat });
})

router.post("/new", upload_imgpost.single('img_title') , async function(req, res){
    //ส่ง img_title 
    let n_name = req.body.name;
    let n_category = req.body.category;
    let n_imgurl = req.file.originalname;
    let n_desc = req.body.desc;
    let n_content = req.body.editor;
    let n_date = new Date();
    await conPost.create({userid : req.user ,name:n_name, category:n_category , imgurl:n_imgurl, desc:n_desc, content:n_content, date:n_date},function(err, result)
    {
      console.log("success post id : " + result._id);
      res.redirect("/blogs/review/" + result._id);
    });
    
});

router.get("/review/:postid", async function(req, res)
{
    //การ join ระหว่าง collection 
    //userid ใน posts join กับ _id ใน users
    const { postid } = req.params;
    const postreview = await conPost.aggregate(
      [
        {
          //select with condition
          $match: 
          { 
            _id : ObjectId(postid)
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
      ],
      );

      const cat = await conCatelog.find();

      const recommend = await conPost.find({category : "ตลาดน้ำ"}).limit(5);
  //     Project.find(query)
  //   .populate({ 
  //     path: 'pages',
  //     populate: [{
  //      path: 'components',
  //      model: 'Component'
  //     },{
  //       path: 'AnotherRef',
  //       model: 'AnotherRef',
  //       select: 'firstname lastname'
  //     }] 
  //  })

      conPost.findById(postid)
        .populate('comments')
        .exec(function(error, All)
        {
          if(error)
          {
              console.log("Error");
          } 
          else 
          {
            res.render("blogs/review",{moment: moment, Blogs : postreview , Category : cat, recommend : recommend, moment : moment, commentPost: All});
          }
        });
      
});

router.get("/edit/:postid", middleware.checkAuthentication, async function(req, res){
  const { postid } = req.params;
  const Editpost = await conPost.findById(postid);
  const cat = await conCatelog.find();
  res.render("blogs/Editpost", { moment: moment, post : Editpost, categories : cat });
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
  res.redirect("/user/me");
});



router.get("/showmore/:name", async function(req, res){
  let { name } = req.params;
  const post = await conPost.find({ category : name });

  res.render("blogs/showmore",{ moment: moment, posts : post});
})

router.post('/comment/:postid', middleware.checkAuthentication, function(req,res)
{
  let { postid } = req.params;
  conPost.findById(postid, function(err, thispost)
  {
    if(err)
    {
      console.log(err);
    } 
    else 
    {
      comment.create({text : req.body.comment, comment_by: req.user.username} , function(err,comment)
      {
        if(err)
        {
          console.log(err);
        } 
        else 
        {
          thispost.comments.push(comment);
          thispost.save();
          res.redirect('/blogs/review/' + thispost._id);
        }
      });
    }
  });
});

router.get("/search",async function(req, res)
{
  let key = req.query.keyword;
  const result = await conPost.find({name:{ $regex: key }});
  res.render("blogs/search",{moment: moment, ItemSearch : result, key : key});
});

router.get("/author/:authorname", async function(req, res)
{
  let {authorname} = req.params;
  console.log(authorname);
  const result = await conUser.aggregate(
    [
      {
        //select 
        $match: 
        { 
          username : authorname
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


  res.render("blogs/author",{moment: moment, profile : result});
})

module.exports = router;