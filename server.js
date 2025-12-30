require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const User = require('./models/User');
const Product = require('./models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

const uploadRoute = require('./routes/upload');
app.use('/api/upload', uploadRoute);

// MongoDB Connection
// Connect to local MongoDB instance
const MONGO_URI = 'mongodb+srv://mylocaldata:meanstackdata@cluster.fsjxyva.mongodb.net/';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));



// Auth Routes

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user._id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// FORGOT PASSWORD
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Simulating email sending
        console.log(`[REST] Forgot password requested for: ${email}`);

        res.json({ message: 'If that email exists, a password reset link has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new product
app.post('/api/products', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                price: req.body.price
            },
            { new: true } // Return the updated document
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reset Collection (Delete All Products)
app.delete('/api/reset', async (req, res) => {
    try {
        await Product.deleteMany({});
        res.json({ message: 'All products have been deleted/reset.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GraphQL logic

// GraphQL Schema
const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    description: String!
    image: String
    price: Float
  }

  type Query {
    getProducts: [Product]
    getProduct(id: ID!): Product
  }

  type Mutation {
    addProduct(name: String!, description: String!, image: String, price: Float): Product
    updateProduct(id: ID!, name: String!, description: String!, image: String, price: Float): Product
    deleteProduct(id: ID!): String
    resetProducts: String

    register(username: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
  }
`);

// Resolvers
const root = {
    getProducts: async () => {
        return await Product.find();
    },
    getProduct: async ({ id }) => {
        return await Product.findById(id);
    },
    addProduct: async ({ name, description, image, price }) => {
        const product = new Product({ name, description, image, price });
        return await product.save();
    },
    updateProduct: async ({ id, name, description, image, price }) => {
        return await Product.findByIdAndUpdate(id, { name, description, image, price }, { new: true });
    },
    deleteProduct: async ({ id }) => {
        await Product.findByIdAndDelete(id);
        return "Product deleted successfully";
    },
    resetProducts: async () => {
        await Product.deleteMany({});
        return "All products have been deleted/reset.";
    },

    register: async ({ username, email, password }) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        return "User registered successfully";
    },

    login: async ({ email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        return jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    }
};

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true // Enable GraphiQL interface
}));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

