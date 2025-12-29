const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

const app = express();
const PORT = 3001;

app.use(cors());

// MongoDB Connection (Same DB)
const MONGO_URI = 'mongodb+srv://mylocaldata:meanstackdata@cluster.fsjxyva.mongodb.net/';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected (GraphQL Server)'))
    .catch(err => console.log('MongoDB Connection Error:', err));



// GraphQL Schema
const schema = buildSchema(`
  type Item {
    id: ID!
    name: String!
    description: String!
    image: String
    price: Float
  }

  type Query {
    getItems: [Item]
    getItem(id: ID!): Item
  }

  type Mutation {
    addItem(name: String!, description: String!, image: String, price: Float): Item
    updateItem(id: ID!, name: String!, description: String!, image: String, price: Float): Item
    deleteItem(id: ID!): String
    resetItems: String

    register(username: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
  }
`);

// Resolvers
const root = {
    getItems: async () => {
        return await Item.find();
    },
    getItem: async ({ id }) => {
        return await Item.findById(id);
    },
    addItem: async ({ name, description, image, price }) => {
        const item = new Item({ name, description, image, price });
        return await item.save();
    },
    updateItem: async ({ id, name, description, image, price }) => {
        return await Item.findByIdAndUpdate(id, { name, description, image, price }, { new: true });
    },
    deleteItem: async ({ id }) => {
        await Item.findByIdAndDelete(id);
        return "Item deleted successfully";
    },
    resetItems: async () => {
        await Item.deleteMany({});
        return "All items have been deleted/reset.";
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
    console.log(`GraphQL Server running on port ${PORT}`);
});
