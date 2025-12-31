require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://mylocaldata:meanstackdata@cluster.fsjxyva.mongodb.net/';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
const authRoute = require('./routes/auth');
const storeRoute = require('./routes/store');
const productRoute = require('./routes/product'); // Refactored to separate file
const invoiceRoute = require('./routes/invoice');
const uploadRoute = require('./routes/upload');
const resetRoute = require('./routes/reset');

app.use('/api/auth', authRoute); // New standard auth route
app.use('/api/stores', storeRoute);
app.use('/api/products', productRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/reset', resetRoute);

// Legacy/Compatibility Redirects (Optional: keep if frontend hardcodes these)
// app.use('/api/register', ... ) -> now handled in /api/auth/register

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
