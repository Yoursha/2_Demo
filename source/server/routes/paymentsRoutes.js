const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Add a new payment record (Append-only operation)
router.post('/add', paymentController.addPaymentRecord);

// Retrieve payment history for a specific user (Fast read operation)
router.get('/history/:username', paymentController.getPaymentHistory);

module.exports = router;