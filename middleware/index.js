conPost = require('../models/posts');

let middlewareObject = {};

middlewareObject.checkAuthor = function(req, res, next){
    //ตรวจสอบก่อนว่ามีการ login แล้วหรือยัง
    if(req.isAuthenticated()){
        //find post 
        conPost.findById(req.params.id, function(err, result)
        {
            if(err)
            {
                res.redirect("/travel");
            } 
            else 
            {
                if(result.author_by.equals(req.user._id)) 
                {
                    next();
                } 
                else 
                {
                    res.redirect("/travel");
                }
            }
        });
    } 
    else 
    {
        res.redirect('back');
    }
}

middlewareObject.checkPermissionAdmin = function(req, res, next)
{
    if(req.isAuthenticated())
    {
        if(req.user.permission === "admin")
        {
            return next();
        }
        else
        {
            res.redirect('/travel');
        }
    } 
    else
    {
        res.redirect("/login");
    }
}


middlewareObject.checkAuthentication = function(req, res, next){
        //ตรวจสอบว่า login แล้วหรือยัง
        if(req.isAuthenticated())
        {
            //ถ้า login แล้ว ให้ next() 
            return next();
        } 
        else
        {
            //กรณีถ้ายังไม่ login จะ redirect ไปหน้าไหนก่อน
            //next() -> เข้าหน้าแรกได้เลย ไม่loginก็ได้
            res.redirect("/login");
        }
    }


module.exports = middlewareObject;