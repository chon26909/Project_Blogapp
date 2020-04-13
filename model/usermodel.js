//model
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/Blogapp";

mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console,'Connection Error'));

//schema table ใน DB
var userSchema = mongoose.Schema({
    username:{ type:String },
    email:{ type:String },
    password:{ type:String}
});
//export model ไปใช้ router ชื่อ users.js
var User = module.exports = mongoose.model('User',userSchema);

// var PostSchema = new mongoose.Schema({
//     name: String,
//     imgurl: String,
//     desc: String
// });
// var conPost = module.exports = mongoose.model('posts',PostSchema);

module.exports.createUser = function(newUser, callback)
{
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save(callback);
        });
    }); 
}
module.exports.getUserById = function(id,callback)
{
    User.findById(id,callback);
}
module.exports.getUserByName = function(username,callback)
{
    var query = { username : username };
    User.findOne(query,callback);
}
module.exports.comparePassword = function(password,hash,callback)
{
    bcrypt.compare(password,hash,function(err,isMatch){
        callback(null,isMatch)
    });
}