const router = require('express').Router();
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');

// Global Reset (Dev utility)
router.delete('/all', async (req, res) => {
    try {
        await User.deleteMany({});
        await Store.deleteMany({});
        await Product.deleteMany({});
        await Invoice.deleteMany({});

        console.log('Global Reset: All collections cleared.');
        res.json({ message: 'All data (Users, Stores, Products, Invoices) has been reset.' });
    } catch (err) {
        console.error('Reset failed:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
