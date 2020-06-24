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
      comment = require('../models/comment'),
      conPrice = require('../models/price'),
      conProvinces = require('../models/provinces');

      var cloudinary = require('cloudinary').v2;
      var { CloudinaryStorage } = require('multer-storage-cloudinary');

//connect DB
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

cloudinary.config({ 
  cloud_name: 'dvzib8cte', 
  api_key: '192494392215866', 
  api_secret: '5uGKxDU0UWmbCtKs7hAS_YzrByY'
});


//ย้ายรูปจาก form หน้า editprofile ไปเก็บในโฟลเดอร์ images/posts
const StorageOfimagepost = new CloudinaryStorage({
  cloudinary : cloudinary,
  // destination:function(req,file,cb){
  //   cb(null,"./public/images/posts/")
  // },
  folder : 'post',
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
    const group1 = await conPost.find({category : "ที่กิน"});

    const group2 = await conPost.find({category: "ที่เที่ยว"});
    
    const group3 = await conPost.find({category : "ที่พัก"});
    
    const cat = await conCatelog.find();

    res.render("blogs/index",{ title: "เที่ยวพาเพลิน", moment: moment, group1:group1, group2:group2, group3:group3, category : cat });
});

router.get("/new", async function(req, res)
{
  const cat = await conCatelog.find();
  const tags = await conTag.find();
  const price = await conPrice.find();
  const provinces = await conProvinces.find();

  const Arraytag = [];
  tags.forEach(function(tag)
  {
    Arraytag.push(tag.name);
  });

  // console.log(tags);
  // console.log(Arraytag);

  res.render("blogs/Addpost",{ title: "สร้างบทความ", moment: moment, categories : cat, Arraytag: Arraytag, Allprice:price, AllProvinces:provinces});
})


router.post("/",middleware.checkAuthentication, upload_imgpost.single('img_title'),function(req, res){
    
  const title = req.body.title;
  const author_by = req.user._id;
  const category = req.body.category;
  const image = req.file.filename;
  const content = req.body.editor;
  const price = req.body.length_price;
  const province = req.body.provinces;
  const map = req.body.map;
  const tag = req.body.tags;
  const date = new Date();
  const dayopen = req.body.day;
  const timeopen = req.body.timestart;
  const timeclose = req.body.timeend;

  


  // objectd = {
  //   monday: req.body.day1 ? true : false,
  //   tuesday: req.body.day2 ? true : false,
  //   wednesday: req.body.day3 ? true : false,
  //   thursday: req.body.day4 ? true : false,
  //   friday: req.body.day5 ? true : false,
  //   saturday: req.body.day6 ? true : false,
  //   sunday: req.body.day7 ? true : false,
  // };

    // console.log(objectd)
  // const allday = req.body.day0
  // const monday = req.body.day1
  // const tuesday = req.body.day2
  // const wednesday = req.body.day3
  // const thursday = req.body.day4
  // const friday = req.body.day5
  // const saturday = req.body.day6
  // const sunday = req.body.day7

  // Array.prototype.convertToObject = function(){
  //   for(let i = 0; i< this.length; i++)
  //   {
  //     this[i] = this[i];
  //   }
  // }

  // const dayOfweek = [allday,monday,tuesday,wednesday,thursday,friday,saturday,sunday]

  // let DayAndTime_isOpen = [];

  // for(i=0; i < dayOfweek.length; i++)
  // {
  //   if(dayOfweek[i] == undefined)
  //   {
  //     continue;
  //   }
  //   else
  //   {
  //     DayAndTime_isOpen.push(dayOfweek[i]);
  //   }
  // }
  // arraydayopen = {allday,monday,tuesday,wednesday,thursday,friday,saturday,sunday};
  console.log("category "+category);
  console.log("price "+price);
  console.log("province "+province);
  console.log("dayopen "+dayopen);
  console.log(timeopen);
  console.log(timeclose);

  // console.log(DayAndTime_isOpen);
  // day.forEach(d => { console.log("day "+d) });
  const Arraytag = tag.split(' ');

  const n_open = 
  {
    day : dayopen,
    open : timeopen,
    close : timeclose
  }

  const newPost = { title:title, author_by:author_by, category:category,tags: Arraytag, image:image, content:content, minimum_cost:price ,openandclose : n_open ,date:date ,province:province, googlemap:map, views:0}

  console.log("newPost "+newPost);
  conPost.create(newPost,function(err, post)
    {
      if(err) console.log(err)
      else
      {

        for(let i=0; i<(Arraytag.length-1) ;i++)
        {
          conTag.create({ name:Arraytag[i] },function(err,successTag)
          {
            console.log(successTag);
          });
        }
        res.redirect("/travel/review/" + post._id);
      }
      
    });
    
});

router.get("/review/:postid",async function(req, res)
{
    const post = await conPost.findById(req.params.postid)
                .populate({path: 'author_by', model: 'User'})
                .populate({path: 'comments', model: 'Comment',options:{ sort:{date : -1}} ,populate:({path: 'comment_by', model: 'User'})})

    const tag = await conTag.find();
    const recommend = await conPost.find().limit(5);

    await conPost.findByIdAndUpdate(req.params.postid, { views: (post.views + 1)})



    // ตรวจสอบว่า ผู้ใช้คนนี้ บันทึกบทความนี้ไว้หรือไม่ boolean
    let favouriteThisPost = false;

    // ถ้ามีผู้ใช้ login เข้ามาแล้ว
    if(req.user)
    {
      // await conPost.find({view:[req.user._id]})
      // นับยอดผู้เข้าชม
      // await conPost.findById(req.params.postid,function(err,ViewcurrentPost)
      // {
      //   if(err)
      //   {
      //     console.log(err)
      //   }
      //   else
      //   {
      //     ViewcurrentPost.views.push(req.user._id);
      //     ViewcurrentPost.save();
      //   }
      // })
      

      // loop favouritePost in user 
      console.log(req.user.favourite.length);
      //วนลูปหาว่า ผู้ใชคนนี้ เก็บpostidของบทความนี้ ในรายการโปรดหรือไม่
      for(let i=0; i < req.user.favourite.length ;i++)
      {
        //ถ้าใช่
        if(req.user.favourite[i].equals(post._id))
        {
          console.log("User favourite this postid = " + req.user.favourite[i]);

          //ใช่ ผู้ใช้คนนี้ชอบบทความนี้ แล้วเพิ่มไปในรายการโปรดแล้ว favouriteThisPost = true
          favouriteThisPost = true;
          break;
        }
        //ไม่ใช่ วนหาต่อไป
        else
        {
          continue;
        }
      };
    }
    
    console.log(favouriteThisPost);
    
    res.render("blogs/review",{ title: post.title, moment:moment, post:post, recommend:recommend, Alltag:tag, favouriteThisPost:favouriteThisPost})
});

router.get("/:id/edit", middleware.checkAuthor, async function(req, res){
  const Editpost = await conPost.findById(req.params.id);
  const cat = await conCatelog.find();
  const tags = await conTag.find();
  const price = await conPrice.find();
  const province = await conProvinces.find();

  let Arraytag = [];
  tags.forEach(function(tag)
  {
    Arraytag.push(tag.name);
  });

  let tagsOfpost = Editpost.tags.join(' ');
  console.log(tags);
  res.render("blogs/edit", { title : "แก้ไขบทความ", moment : moment, post : Editpost, categories : cat , Arraytag : Arraytag, tagsOfpost:tagsOfpost,Allprice :price, AllProvinces:province});
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
                const title = req.body.title;
                const category = req.body.category;
                const image = req.file.filename;
                const content = req.body.editor;
                const price = req.body.length_price;
                const province = req.body.provinces;
                const map = req.body.map;
                const tag = req.body.tags;
                const dayopen = req.body.day;
                const timeopen = req.body.timestart;
                const timeclose = req.body.timeend;

                let date = new Date();

                const Arraytag = tag.split(' ');

                const n_open = 
                {
                  day : dayopen,
                  open : timeopen,
                  close : timeclose
                }
              
                const updatePost = { title:title, category:category,tags: Arraytag, image:image, content:content, minimum_cost:price ,openandclose : n_open ,date:date ,province:province, googlemap:map, views:0}

                conPost.findByIdAndUpdate(req.params.id,updatePost,function(err,sucess)
                {
                  for(let i=0; i<(Arraytag.length-1) ;i++)
                      {
                        conTag.create({ name:Arraytag[i] },function(err,successTag)
                        {
                          console.log(successTag);
                        });
                      }
                  res.redirect("/travel/review/" + req.params.id);
                });
                
              }
          })
      }
    })
    
  }
  else
  {
    //ส่งรูปไปเก็บในโฟลเดอร
    const title = req.body.title;
    const category = req.body.category;
    const content = req.body.editor;
    const price = req.body.length_price;
    const province = req.body.provinces;
    const map = req.body.map;
    const tag = req.body.tags;
    const dayopen = req.body.day;
    const timeopen = req.body.timestart;
    const timeclose = req.body.timeend;

    let date = new Date();

    const Arraytag = tag.split(' ');

    const n_open = 
    {
      day : dayopen,
      open : timeopen,
      close : timeclose
    }
  
    const updatePost = { title:title, category:category,tags: Arraytag, content:content, minimum_cost:price ,openandclose : n_open ,date:date ,province:province, googlemap:map}
  
    
          


    conPost.findByIdAndUpdate(req.params.id,updatePost,function(err,sucess)
    {
      for(let i=0; i<(Arraytag.length-1) ;i++)
          {
            conTag.create({ name:Arraytag[i] },function(err,successTag)
            {
              console.log(successTag);
            });
          }
          res.redirect("/travel/review/" + req.params.id);
    }) 
  } 
})


router.delete("/:postid",async function(req, res){
  conPost.findById(req.params.postid, function(err, currentpost){
    if(err)
    {
        res.redirect('/user/me');
    } 
    else 
    {
        const imagePath = './public/images/posts/' + currentpost.image;
        fs.unlink(imagePath, function(err)
        {
            if(err)
            {
                console.log(err);
                res.redirect('/user/me');
            }
        })


        currentpost.comments.forEach(c => { comment.findByIdAndDelete( c,function(err,success) {if(err)console.log(err)} ) });
    }
    
  })

  await conPost.findByIdAndRemove(req.params.postid);
  res.redirect("/user/me");

});



router.post("/favorite/:postid",function(req, res)
{
  // ไปหาบทความว่ามีอยู่ใน DB หรือไม่
  conPost.findById(req.params.postid,function(err,post)
  {
    
    let thisfav = false;
    if(err)
    {
      return res.send(err);
    }
    else
    {
      // ถ้ามีบทความนี้อยู่ใน DB จริงๆ
      // ต่อให้ไปค้นผู้ใช้ คนนี้ว่าเคยบันทึกบทความนี้หรือยัง
      conUser.findById(req.user._id,function(err,thisUser)
      {
        if(err)
        {
          return res.send(err);
        }
        else
        {
          // loop favouritePost in user ดูว่าเคยเพิ่มรายการนี้ไปแล้วหรือยัง
          for(let i=0; i < thisUser.favourite.length ;i++)
          {
            if(thisUser.favourite[i].equals(post._id))
            {
              console.log("User favourited is " + thisUser.favourite[i]);
              thisfav = true;
              break;
            }
            else
            {
              continue;
            }
          };

          if(thisfav == false)
          {
            thisUser.favourite.push(post._id);
            thisUser.save();
            return res.send(post);
          }
          
        }
      })
    }
  })
});

router.delete("/favorite/:postid",function(req, res)
{
  conPost.findById(req.params.postid,function(err,post)
  {
    let thisfav = false;
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
            thisUser.favourite.pull(post._id);
            thisUser.save()
            return res.send(post);      
        }
      })
    }
  })
})

router.get("/category/:name", async function(req, res){
  const post = await conPost.find({ category : req.params.name }).sort({date: -1});
  res.render("blogs/showmore",{ title: req.params.name, moment: moment, posts : post});
})

router.post("/comment/:postid", middleware.checkAuthentication, function(req,res)
{
  // ค้นหาบทความว่ามีใน DB จริงๆมั้ย
  conPost.findById(req.params.postid, function(err, thispost)
  {
    if(err)
    {
      console.log(err);
    } 
    else 
    {
      // จริง
      // ให้เอา create comment ลงใน collection ชื่อ comments
      comment.create({text : req.body.text, comment_by : req.user._id, date: Date.now()} , function(err,comment)
      {
        if(err)
        {
          console.log(err);

          return res.send(err);
        } 
        else 
        {
          // หลังจากเอา commment ลง DB สำเร้จ ให้นำ commentid เก็บลงไปในบทความนั้นด้วย
          thispost.comments.push(comment);
          thispost.save();

          return res.send(comment._id);
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

router.delete("/comment/:postid/:commentid",async function(req,res)
{
  const commentid = req.params.commentid;
  const postid = req.params.postid;
  
  conPost.findById(postid,function(err,thispost)
  {
    for(let i=0; i<thispost.comments.length; i++)
    {
      if( thispost.comments[i].equals(commentid) )
      {
        thispost.comments.splice(i, 1);
        thispost.save();
      }
    }
  })

  await comment.findByIdAndDelete(commentid);
});


router.get("/search",async function(req, res)
{
  const key = req.query.keyword;

  const result = await conPost.find({ tags:{ $regex: key }  });
  const lengthOfcost = await conPrice.find();
  const filterLength_price = null;
  const provinces = await conProvinces.find();
  res.render("blogs/search",{ title: "ค้นหา "+key,moment: moment, ItemSearch : result, key : key, Allprice:lengthOfcost,currentCost:filterLength_price,filterProvinces:provinces});
});

router.get("/search/filter",async function(req, res)
{
  const key = req.query.keyword;
  const filterLength_price = req.query.length_price; 
  const filterprovince = req.query.selectprovinces; 

  if(filterprovince == "" && filterLength_price == "")
  {
    var query = { tags:{ $regex: key }}
  }
  else if(filterprovince == "")
  {
    var query = { tags:{ $regex: key }, minimum_cost: { $lte : filterLength_price} }
  }
  else if(filterLength_price == "")
  {
    var query = { tags:{ $regex: key }, province: { $regex: filterprovince } }
  }
  else
  {
    var query = { tags:{ $regex: key }, minimum_cost: { $lte : filterLength_price}, province:{ $regex: filterprovince } }
  }


  result = await conPost.find(query)
  
  const lengthOfcost = await conPrice.find();
  const provinces = await conProvinces.find();

  res.render("blogs/search",{title: "ค้นหา "+key, moment: moment, ItemSearch : result, key : key, Allprice:lengthOfcost, currentCost:filterLength_price,filterProvinces:provinces});
});

router.get("/tag",async function(req, res)
{
  const tag = req.query.keyword;
  
  const result = await conPost.find({ tags:{ $regex: tag } });
  res.render("blogs/search",{title: "ค้นหา "+key, moment: moment, ItemSearch : result, key : tag});
});

router.get("/author/:authorid", async function(req, res)
{
  
  const post = await conPost.find({ author_by :req.params.authorid});
  const author = await conUser.findById(req.params.authorid);
  res.render("blogs/author",{title: "บทความของ "+author.username ,moment: moment, profile : post, author:author});
})

module.exports = router;