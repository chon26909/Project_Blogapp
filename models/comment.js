const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
    
    text: String,
    comment_by:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
});

module.exports = mongoose.model('Comment', commentSchema);