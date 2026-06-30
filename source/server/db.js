// db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Construct the URI using the environment variable
const uri = `mongodb+srv://quangkhai26101984:${process.env.DB_PASSWORD}@cluster0.aq2jbqv.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri);
let dbConnection;

module.exports = {
    connectToServer: async function () {
        try {
            await client.connect();
            // Define your database name here
            dbConnection = client.db('auth');
            console.log("✅ Successfully connected to MongoDB Atlas");
        } catch (err) {
            console.error("❌ MongoDB connection error:", err);
            process.exit(1); // Exit if we can't connect to the DB
        }
    },
    getDb: function () {
        return dbConnection;
    }
};