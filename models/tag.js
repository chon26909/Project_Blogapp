const   mongoose = require('mongoose');

let hashtagSchema = new mongoose.Schema({
    
    // tag: String,
    // category:
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Categories'
    //     }
    name: String,
    _tags: Number
});

module.exports = mongoose.model('Tag', hashtagSchema);