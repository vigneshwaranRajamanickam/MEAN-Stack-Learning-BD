const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    sku: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 0
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        // Making it required for future products, but might need migration for existing
        // For now, let's keep it optional to prevent immediate crashes, but logic will require it
        required: false
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    }
}); module.exports = mongoose.model('Product', ProductSchema);
