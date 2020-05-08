const express = require('express'),
      router = express.Router(),
      passport = require('passport');

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

module.exports = router;
