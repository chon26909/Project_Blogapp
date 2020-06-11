const   mongoose = require('mongoose');

let provincesSchema = new mongoose.Schema({
    name:String
});

module.exports = mongoose.model('Provinces', provincesSchema);