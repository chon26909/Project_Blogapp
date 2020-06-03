const   mongoose = require('mongoose');

let hashtagSchema = new mongoose.Schema({
    
    tag: String,
    category:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categories'
        }
});

module.exports = mongoose.model('Tag', hashtagSchema);