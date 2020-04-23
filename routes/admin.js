var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');

router.get("/",function(req,res)
{
    res.send("Wellcome Admin");
});

module.exports = router;