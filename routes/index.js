const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      conUser = require('../models/user'),
      bcrypt = require('bcryptjs');

const { check, validationResult } = require('express-validator');

/* GET landing page. */
router.get("/",function(req, res){
  res.render("landing");
});

router.get("/login", function(_req, res)
{
  res.render("users/login");
});

router.post("/login", passport.authenticate('local',{
  failureRedirect:'/login',
  failureFlash:false
}),
function(req, res)
{
  // สำเร็จ
  res.redirect('/blogs');
});

router.get("/logout", function(req, res)
{
  //ทำลาย session ทิ้ง
  req.logout();
  res.redirect("/blogs");
});


router.get("/register", function(_req, res)
{
  res.render("users/register");
});

router.post("/register",[
  check("username","กรุณาป้อนชื่อผู้ใช้").not().isEmpty(),
  check("email","กรุณาป้อนอีเมล").isEmail(),
  check("password","กรุณาป้อนรหัสผ่าน").not().isEmpty(),
  check("password2","กรุณายืนยันรหัสผ่าน").not().isEmpty()
  ] ,function(req, res)
  {
    const result = validationResult(req);
    var errors = result.errors;
    if(!result.isEmpty())
    {
      //return to page
      res.render("register", { errors : errors });
    }
    else
    {
      let username = req.body.username;
      let email = req.body.email;
      let password = req.body.password;
      let password2 = req.body.password2;

      //ค่าเริ่มต้นในการ register แล้วค่อยไปเพิ่มข้อมูลอื่นๆ ในภายหลัง
      var newUser = new User
      ({
        username:username,
        email:email,
        password:password,
        image: "no-imgprofile.png"
      })
      User.createUser(newUser,function(err){
        if(err) console.log(err);
        else
        {
          res.location('/blogs/');
          res.redirect('/blogs/login');
        }
      });
      
    }
});

router.get("/reset",function(req, res)
{
  res.render("users/resetPassword");
});

router.post("/resetByEmail",async function(req, res)
{
  const email = req.body.email;
  console.log(email);
  const result = await conUser.find({email: email});
  console.log(result[0]._id);
  res.render("users/changePassword",{user_reset:result[0]});
});

router.post("/changePassword:userid", function(req, res)
{
  const { userid } = req.params;
  const password = req.body.password1;
  console.log(password);
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password , salt, function(err, hash) 
      {
        console.log(hash);
        conUser.update({_id : userid},{$set: {password : hash}},function(err,result)
        {
          if(err) throw err
          else
          {
            res.redirect("/login");
          }
        });
        
      })
  });
});


module.exports = router;
