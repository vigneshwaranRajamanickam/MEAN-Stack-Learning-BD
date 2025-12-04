const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

// MongoDB Connection (Same DB)
const MONGO_URI = 'mongodb://localhost:27017/mean-learning-db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected (GraphQL Server)'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Mongoose Model (Reusing the schema logic, ideally should be shared)
const ItemSchema = new mongoose.Schema({
    name: String,
    description: String
});
const Item = mongoose.model('Item', ItemSchema);

// GraphQL Schema
const schema = buildSchema(`
  type Item {
    id: ID!
    name: String!
    description: String!
  }

  type Query {
    getItems: [Item]
    getItem(id: ID!): Item
  }

  type Mutation {
    addItem(name: String!, description: String!): Item
    updateItem(id: ID!, name: String!, description: String!): Item
    deleteItem(id: ID!): String
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
    addItem: async ({ name, description }) => {
        const item = new Item({ name, description });
        return await item.save();
    },
    updateItem: async ({ id, name, description }) => {
        return await Item.findByIdAndUpdate(id, { name, description }, { new: true });
    },
    deleteItem: async ({ id }) => {
        await Item.findByIdAndDelete(id);
        return "Item deleted successfully";
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
