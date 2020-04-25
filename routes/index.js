var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET landing page. */
router.get("/",function(req, res){
  res.render("land");
})

module.exports = router;
