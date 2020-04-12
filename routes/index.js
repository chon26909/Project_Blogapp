var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get("/",function(req, res){
  res.render("landing");
})
//ถ้า login แบ้วจะแสดงอีกหน้านึ่ง
router.get('/index',checkAuthentication, function(req, res, next) {
  res.render('index', { });
});
function checkAuthentication(req,res,next){
  if(req.isAuthenticated())
  {
      return next();
  } 
  else
  {
      return next();
  }
}

module.exports = router;
