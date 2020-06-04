const   mongoose = require('mongoose');

let priceSchema = new mongoose.Schema({
    minimum_price: Int32,
    maximum_price: Int32
});

module.exports = mongoose.model('Price', priceSchema);