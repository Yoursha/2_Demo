/**
 * Controller for handling append-heavy transaction data.
 * Ideal for a Document Store or Column Family Database.
 */

exports.addPaymentRecord = async (req, res) => {
    try {
        const payload = req.body;

        /* Expected payload from frontend:
           {
               transactionId: 'TXN-ABC123XYZ',
               user: 'dat_nguyen',
               restaurant: 'Phở Hòa', 
               item: 'Phở Đặc Biệt',
               amount: 65000,
               currency: 'VND',
               timestamp: '2026-06-30T14:23:24.000Z',
               status: 'SUCCESS'
           }
        */

        // 1. Validate payload structure.
        // 2. Perform a fast INSERT operation into your NoSQL collection (e.g., db.payment_logs.insertOne(payload)).
        // Note: No ACID transaction or cross-table locking is needed here; it's a pure append.

        res.status(201).json({
            message: "Payment record added successfully to NoSQL datastore",
            data: payload
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to write payment record." });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const { username } = req.params;

        // 1. Query the NoSQL collection using an index on the 'user' field.
        // Example MongoDB query: db.payment_logs.find({ user: username }).sort({ timestamp: -1 })
        // Example Cassandra query: SELECT * FROM payment_logs WHERE user = username ORDER BY timestamp DESC

        // 2. Return the retrieved document array.

        res.status(200).json({
            message: "Payment history fetched",
            data: [] // Replace with actual DB result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch payment history." });
    }
};