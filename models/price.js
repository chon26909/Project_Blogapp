const   mongoose = require('mongoose');

let priceSchema = new mongoose.Schema({
    minimum_price: Number,
    maximum_price: Number
});

module.exports = mongoose.model('Price', priceSchema);