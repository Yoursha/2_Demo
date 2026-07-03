// db.js
const { MongoClient,ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Construct the URI using the environment variable
const uri = `mongodb://quangkhai26101984:${process.env.DB_PASSWORD}@ac-uzjthum-shard-00-00.aq2jbqv.mongodb.net:27017,ac-uzjthum-shard-00-01.aq2jbqv.mongodb.net:27017,ac-uzjthum-shard-00-02.aq2jbqv.mongodb.net:27017/?ssl=true&replicaSet=atlas-13cz48-shard-0&authSource=admin&appName=Cluster0`;
const serverApi = {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
};

const client = new MongoClient(uri, { serverApi: serverApi });
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