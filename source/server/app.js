const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies from frontend fetch requests
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/paymentsRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/payments', paymentsRoutes);

// Database Connection Placeholder (e.g., MongoDB/Document Store)
const connectDB = async () => {
    // Connect to your NoSQL database here
};

// Start Server
app.listen(port, () => {
    console.log(`Food Delivery API running on http://localhost:${port}`);
    connectDB();
});