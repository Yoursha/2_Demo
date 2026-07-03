const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');

// Add a new payment record (Append-only operation)
router.post('/add', paymentsController.addPaymentRecord);

// Retrieve payment history for a specific user (Fast read operation)
router.get('/history/:username', paymentsController.getPaymentHistory);

module.exports = router;