const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String, // URL to the image
    price: Number
});

module.exports = mongoose.model('Product', ProductSchema);
