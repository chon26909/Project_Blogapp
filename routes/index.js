const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      conUser = require('../models/user'),
      bcrypt = require('bcryptjs'),
      bodyParser = require('body-parser');

const { check, validationResult } = require('express-validator');

/* GET landing page. */
router.get("/",function(req, res){
  res.render("landing");
});

router.get("/login", function(req, res)
{
  const currentURL = req.params;
  console.log(currentURL);
  res.render("users/login");
});

router.post("/login", passport.authenticate('local',{
  failureRedirect:'/login',
  failureFlash:false
}),
function(req, res)
{
  // login สำเร็จ

  // ถ้าเป็น admin
  if(req.user.permission === "admin")
  {
    res.redirect('/admin');
  }
  else
  {
    res.redirect('/travel');
  }
  
});

router.get("/logout", function(req, res)
{
  //ทำลาย session ทิ้ง
  req.logout();
  res.redirect("/travel");
});


router.get("/register", function(_req, res)
{
  res.render("users/login");
});

router.post("/register",[
  check("username_register","กรุณาป้อนชื่อผู้ใช้").not().isEmpty(),
  check("email_register","กรุณาป้อนอีเมล").isEmail(),
  check("password_register","กรุณาป้อนรหัสผ่าน").not().isEmpty(),
  check("password2_register","กรุณายืนยันรหัสผ่าน").not().isEmpty(),
  //check("password3","กรุณายืนยันรหัสผ่าน").not().isEmpty(),
  ] ,function(req, res)
  {
    const result = validationResult(req);
    var errors = result.errors;
    if(!result.isEmpty())
    {
      //return to page
      res.render("users/login", { errors : errors });
    }
    else
    {
      let username = req.body.username_register;
      let email = req.body.email_register;
      let password = req.body.password_register;
      let password2 = req.body.password2;
      //let password3 = req.body.password3;

      console.log(username);
      console.log(email);

      //ค่าเริ่มต้นในการ register แล้วค่อยไปเพิ่มข้อมูลอื่นๆ ในภายหลัง
      const newUser = new conUser
      ({
        username : username,
        email : email,
        password : password,
        image: "no-imgprofile.png",
        facebook: "ไม่มีข้อมูล",
        line : "ไม่มีข้อมูล",
        phone : "ไม่มีข้อมูล"
      })

      conUser.createUser(newUser,function(err){
        if(err) console.log(err);
        else
        {
         /* res.location('/travel/');*/
          res.redirect('/login');
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
