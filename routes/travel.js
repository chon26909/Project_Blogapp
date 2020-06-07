const express = require('express'),
      router = express.Router(),
      bodyParser = require('body-parser'),
      moment = require('moment'),
      multer = require('multer'),
      path = require('path'),
      fs = require('fs'),
      middleware = require('../middleware'),
      conUser = require('../models/user'),
      conPost = require('../models/posts'),
      conCatelog = require('../models/categories'),
      conTag = require('../models/tag'),
      comment = require('../models/comment');

//connect DB
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});



//ย้ายรูปจาก form หน้า editprofile ไปเก็บในโฟลเดอร์ images/posts
const StorageOfimagepost = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./public/images/posts/")
  },
  filename:function(req,file,cb){
    //เปลี่ยนชื่อรูปก่อนเก็บลงโฟลเดอร์
    cb(null,file.fieldname + '-' + Date.now());
  }
});
const imageFilter = function(req, file, cb){
  var ext = path.extname(file.originalname);
  if(ext !== '.png' && ext !== '.gif' && ext !== '.jpg' && ext !== '.jpeg'){
      return cb(new Error('ต้องเป็นไฟล์รูปภาพเท่านั้น'), false)
      }
      cb(null, true);
};

var upload_imgpost = multer({storage : StorageOfimagepost, fileFilter: imageFilter});

//แสดงหน้าแรก ถ้า login แล้วจะแสดงอีกหน้านึ่ง
router.get('/', async function(req, res,) {
  //ไปดึงข้อมูล posts มาแสดงหน้าแรก
    const songkran_post = await conPost.find({category : "เที่ยวสงกรานต์"}).limit(4);

    const market_post = await conPost.find({category: "ตลาดกลางคืน"});
    
    const marketfloat_post = await conPost.find({category : "ตลาดน้ำ"});
    
    const cat = await conCatelog.find();

    res.render("blogs/index",{ moment: moment, section1 : songkran_post, Marketfloat : marketfloat_post, Category : cat });
});

router.get("/new",async function(req, res)
{
  const cat = await conCatelog.find();
  const tags = await conTag.find();
  
  const Arraytag = [];
  tags.forEach(function(tag)
  {
    Arraytag.push(tag.name);
  });

  console.log(tags);
  console.log(Arraytag);

  res.render("blogs/Addpost",{ moment: moment, categories : cat, Arraytag: Arraytag});
})


router.get("/tag",async function(req,res)
{
  await conTag.create({name: "ตลาดจตุจักร"});
})

router.post("/", upload_imgpost.single('img_title') ,function(req, res){
    
  const title = req.body.title;
  const author_by = req.user._id;
  const category = req.body.category;
  const image = req.file.filename;
  const content = req.body.editor;
  const date = new Date();
  const Arraytag = req.body.tag.split(" ");
  console.log(Arraytag);

  const newPost = { title:title, author_by:author_by, category:category,tags: Arraytag, image:image, content:content, date:date }

  conPost.create(newPost,function(err, post)
    {
      if(err) console.log(err)
      else
      {
        res.redirect("/travel/review/" + post._id);
      }
      
    });
    
});

router.get("/review/:postid",async function(req, res)
{
    const post = await conPost.findById(req.params.postid)
                .populate({path: 'author_by', model: 'User'})
                .populate({path: 'comments', model: 'Comment',populate:({path: 'comment_by', model: 'User'})})

    const category = await conCatelog.find();
    const recommend = await conPost.find().limit(5);

    // ตรวจสอบว่า ผู้ใช้คนนี้ บันทึกบทความนี้ไว้หรือไม่ boolean
    let favouriteThisPost = false;

    if(req.user)
    {
      // await conPost.find({view:[req.user._id]})
      await conPost.findById(req.params.postid,function(err,ViewcurrentPost)
      {
        if(err)
        {
          console.log(err)
        }
        else
        {
          ViewcurrentPost.views.push(req.user._id);
          ViewcurrentPost.save();
        }
      })
      
      // loop favouritePost in user 
      console.log(req.user.favourite.length);
      for(let i=0; i < req.user.favourite.length ;i++)
      {
        if(req.user.favourite[i].equals(post._id))
        {
          console.log("User favourite this postid = " + req.user.favourite[i]);
          favouriteThisPost = true;
          break;
        }
        else
        {
          continue;
        }
      };
    }
    
    console.log(favouriteThisPost);
    
    res.render("blogs/review",{ moment:moment, post:post, recommend:recommend, category:category, favouriteThisPost:favouriteThisPost})
});

router.get("/:id/edit", middleware.checkAuthor, async function(req, res){
  const Editpost = await conPost.findById(req.params.id);
  const cat = await conCatelog.find();
  res.render("blogs/Editpost", { moment: moment, post : Editpost, categories : cat });
});

router.put("/:id", middleware.checkAuthor, upload_imgpost.single('img_title'), async function(req,res){

  console.log(req.params.id);
  //ถ้ามีการอัพเดตรูปภาพ
  if(req.file)
  { 
    conPost.findById(req.params.postid, function(err, currentpost){
      if(err){
          res.redirect('/user/me');
      } else {
          const imagePath = './public/images/posts/' + currentpost.image;
          fs.unlink(imagePath, function(err){
              if(err){
                  console.log(err);
                  res.redirect('/user/me');
              }
              else
              {
                //ส่งรูปไปเก็บในโฟลเดอร
                let n_name = req.body.title;
                let n_category = req.body.category;
                let n_imgurl = req.file.filename;
                let n_content = req.body.editor;
                let n_date = new Date();
                conPost.findByIdAndUpdate(req.params.id,{title:n_name, category:n_category , image : n_imgurl, content:n_content, date:n_date},function(err,sucess)
                {
                  res.redirect("/travel/review/" + req.params.id);
                });
                
              }
          })
      }
    })
    
  }
  else
  {
    //ถ้าไม่มีการอัพเดตรูปภาพ
    let n_name = req.body.title;
    let n_category = req.body.category;
    let n_content = req.body.editor;
    let n_date = new Date();
    await conPost.findByIdAndUpdate(req.params.id,{title:n_name, category:n_category, content:n_content, date:n_date});
    res.redirect("/travel/review/" + req.params.id);
  }  
});

router.delete("/:postid",async function(req, res){
  conPost.findById(req.params.postid, function(err, currentpost){
    if(err){
        res.redirect('/user/me');
    } else {
        const imagePath = './public/images/posts/' + currentpost.image;
        fs.unlink(imagePath, function(err){
            if(err){
                console.log(err);
                res.redirect('/user/me');
            }
            else
            {
              
            }
        })
    }
    
})
  await conPost.findByIdAndRemove(req.params.postid);
  res.redirect("/user/me");
});


router.post("/favorite/:postid",function(req, res)
{
  conPost.findById(req.params.postid,function(err,post)
  {
    if(err)
    {
      return res.send(err);
    }
    else
    {
      conUser.findById(req.user._id,function(err,thisUser)
      {
        if(err)
        {
          return res.send(err);
        }
        else
        {
          thisUser.favourite.push(post._id);
          thisUser.save()
          return res.send(post);
        }
      })
    }
  })
  
})


router.get("/showmore/:name", async function(req, res){

  const post = await conPost.find({ category : req.params.name });
  res.render("blogs/showmore",{ moment: moment, posts : post});
})

router.post("/comment/:postid", middleware.checkAuthentication, function(req,res)
{
  conPost.findById(req.params.postid, function(err, thispost)
  {
    if(err)
    {
      console.log(err);
    } 
    else 
    {
      comment.create({text : req.body.text, comment_by : req.user._id} , function(err,comment)
      {
        if(err)
        {
          console.log(err);

          return res.send(err);
        } 
        else 
        {
          thispost.comments.push(comment);
          thispost.save();

          return res.send(comment);
        }
      });
    }
  });
});

router.put("/comment/:commentid/edit",async function(req, res)
{
  // console.log(JSON.stringify(req.body));
  // console.log(req.body.text);
  await comment.findByIdAndUpdate(req.params.commentid,{text:req.body.text});
})

router.delete("/comment/:commentid",async function(req,res)
{
    const commentid = req.params.commentid;
    await comment.findByIdAndDelete(commentid);
});


router.get("/search",async function(req, res)
{
  let key = req.query.keyword;
  const result = await conPost.find({title:{ $regex: key }});
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