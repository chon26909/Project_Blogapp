module.exports = 
{
    checkAuthentication(req,res,next){
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
          res.redirect("/blogs/login");
        }
      }    
};