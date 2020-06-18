const   mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
    author_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    category: String,
    image: String,
    content: String,
    date: Date,
    comments: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    tags: Array,
    views:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    minimum_cost : Number, 
    province: String,
    googlemap: String,
    openandclose: Array
    
})

module.exports = mongoose.model('Post', PostSchema);