const router = require('express').Router();
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// Get all products (Filter by Store ID)
router.get('/', verifyToken, async (req, res) => {
    try {
        const storeId = req.query.storeId || req.user.storeId;
        const query = storeId ? { storeId } : {};
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new product
router.post('/', verifyToken, async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
        stock: req.body.stock,
        storeId: req.body.storeId || req.user.storeId,
        sku: req.body.sku
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Bulk Create Products
router.post('/bulk', verifyToken, async (req, res) => {
    try {
        const productsData = req.body; // Expecting an array
        if (!Array.isArray(productsData)) {
            return res.status(400).json({ message: 'Input must be an array of products' });
        }

        // Use storeId from query param (active store) or fallback to token
        const storeId = req.query.storeId || req.user.storeId;

        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required for bulk upload.' });
        }

        const productsToInsert = productsData.map(p => ({
            ...p,
            storeId: storeId
        }));

        const insertedProducts = await Product.insertMany(productsToInsert);
        res.status(201).json(insertedProducts);
    } catch (err) {
        res.status(500).json({ message: 'Bulk upload failed: ' + err.message });
    }
});

// Update a product
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a product
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reset Collection (Delete All Products for a store)
router.delete('/reset', verifyToken, async (req, res) => {
    try {
        const storeId = req.query.storeId || req.user.storeId;
        if (!storeId) return res.status(400).json({ message: "Store ID required" });

        await Product.deleteMany({ storeId });
        res.json({ message: 'All products for this store have been deleted/reset.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
