const mongoose = require('mongoose');
let commentSchema = new mongoose.Schema({
    text: String,
    username: String
});
module.exports = mongoose.model('Comment', commentSchema);