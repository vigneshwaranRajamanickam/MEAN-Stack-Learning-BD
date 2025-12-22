const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
// Connect to local MongoDB instance
const MONGO_URI = 'mongodb+srv://mylocaldata:meanstackdata@cluster.fsjxyva.mongodb.net/';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Simple Schema and Model
const ItemSchema = new mongoose.Schema({
    name: String,
    description: String
});

const Item = mongoose.model('Item', ItemSchema);

// Routes

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new item
app.post('/api/items', async (req, res) => {
    const item = new Item({
        name: req.body.name,
        description: req.body.description
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an item
app.put('/api/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description
            },
            { new: true } // Return the updated document
        );
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
