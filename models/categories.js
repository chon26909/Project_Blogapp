const mongoose = require('mongoose');
//รูปแบบ schema ของ categories
let CatelogSchema = new mongoose.Schema({
    name: String,
})
module.exports = mongoose.model('Categories', CatelogSchema);