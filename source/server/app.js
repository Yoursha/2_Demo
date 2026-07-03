// app.js
const express = require('express');
const cors = require('cors');
const { connectToServer } = require('./db'); // MongoDB
const { connectToRedis } = require('./redisDb'); // <-- Add Redis
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/restaurants', restaurantRoutes);

// Connect to both databases, then start the server
Promise.all([connectToServer(), connectToRedis()])
    .then(() => {
        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("Failed to start server due to database connection issues", err);
    });