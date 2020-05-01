
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId;
mongoose.connect('mongodb+srv://chon:1234@cluster0-zk4v3.mongodb.net/Blog?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});
//รูปแบบ schema ของ posts
let PostSchema = new mongoose.Schema({
    userid: ObjectId,
    name: String,
    category: String,
    imgurl: String,
    content: String,
    date: Date,
    comment: String,
    view: String,
})
let conPost = mongoose.model("post",PostSchema);