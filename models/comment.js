const mongoose = require('mongoose');
let commentSchema = new mongoose.Schema({
    
    text: String,
    comment_by: String
});
module.exports = mongoose.model('Comment', commentSchema);