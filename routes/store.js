const router = require('express').Router();
const Store = require('../models/Store');
const { verifyToken } = require('../middleware/auth');

// Create Store
router.post('/', verifyToken, async (req, res) => {
    try {
        const newStore = new Store({
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            ownerId: req.user.userId
        });
        const savedStore = await newStore.save();
        res.status(201).json(savedStore);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Stores (for user)
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = {};
        // If not superadmin, maybe only show stores user owns or belongs to?
        // For now, let's just return all stores for simplicity or filter by owner
        // query = { ownerId: req.user.userId }; 
        const stores = await Store.find(query);
        res.json(stores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Single Store
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) return res.status(404).json({ message: 'Store not found' });
        res.json(store);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Store
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone
        };
        const updatedStore = await Store.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedStore) return res.status(404).json({ message: 'Store not found' });
        res.json(updatedStore);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
