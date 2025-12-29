const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String, // URL to the image
  price: Number
});

module.exports = mongoose.model('Item', ItemSchema);
