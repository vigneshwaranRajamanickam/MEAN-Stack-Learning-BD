const router = require('express').Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// Create Invoice
router.post('/', verifyToken, async (req, res) => {
    const session = await Invoice.startSession();
    session.startTransaction();
    try {
        const { items, customerName, customerPhone, paymentMethod, storeId } = req.body;
        const targetStoreId = storeId || req.user.storeId;

        if (!targetStoreId) {
            throw new Error('Store ID is required');
        }

        let totalAmount = 0;
        const processedItems = [];

        // Validate stock and calculate total
        for (const item of items) {
            const product = await Product.findOne({ _id: item.productId, storeId: targetStoreId }).session(session);
            if (!product) {
                throw new Error(`Product ${item.productName} not found in this store`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            product.stock -= item.quantity;
            await product.save({ session });

            processedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
                subtotal: product.price * item.quantity
            });
            totalAmount += product.price * item.quantity;
        }

        const newInvoice = new Invoice({
            invoiceNumber: `INV-${Date.now()}`,
            storeId: targetStoreId,
            cashierId: req.user.userId,
            customerName,
            customerPhone,
            items: processedItems,
            totalAmount,
            paymentMethod
        });

        await newInvoice.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newInvoice);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: err.message });
    }
});

// Get Invoices (Filter by Store)
router.get('/', verifyToken, async (req, res) => {
    try {
        const storeId = req.query.storeId || req.user.storeId;
        const query = storeId ? { storeId } : {};
        const invoices = await Invoice.find(query).sort({ date: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
