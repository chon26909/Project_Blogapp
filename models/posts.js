
const   mongoose = require('mongoose'),
        ObjectId = require('mongodb').ObjectId;

//รูปแบบ schema ของ posts
let PostSchema = new mongoose.Schema({
    userid : ObjectId,
    name: String,
    category: String,
    imgurl: String,
    content: String,
    date: Date,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    view: String,
})
module.exports = mongoose.model('Post', PostSchema);