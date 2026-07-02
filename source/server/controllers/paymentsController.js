/**
 * Controller for append-heavy payment transaction data.
 * Uses Apache Cassandra — Column-Family NoSQL database.
 *
 * Table design:
 *   PRIMARY KEY (username, timestamp)
 *   → Partition key  : username  — all rows for a user live on the same node (fast write & read)
 *   → Clustering key : timestamp DESC — rows within a partition are pre-sorted newest-first
 */
const { client, KEYSPACE } = require('../cassandraDb');

// --- Append-only INSERT (no locking, no ACID) ---
exports.addPaymentRecord = async (req, res) => {
    try {
        const { transactionId, user, restaurant, item, amount, currency, timestamp, status } = req.body;

        if (!transactionId || !user || !restaurant || !item || amount === undefined) {
            return res.status(400).json({ error: 'Missing required payment fields.' });
        }

        const query = `
            INSERT INTO ${KEYSPACE}.payment_logs
                (username, timestamp, transaction_id, restaurant, item, amount, currency, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await client.execute(query, [
            user,
            new Date(timestamp || Date.now()),
            transactionId,
            restaurant,
            item,
            amount,
            currency || 'VND',
            status  || 'SUCCESS'
        ], { prepare: true }); // prepared statements → fast repeated writes

        console.log(`💳 Payment written to Cassandra: ${transactionId} by ${user}`);

        res.status(201).json({
            message: 'Payment record added to Apache Cassandra (Column-Family)',
            data: req.body
        });
    } catch (error) {
        console.error('Cassandra INSERT error:', error);
        res.status(500).json({ error: 'Failed to write payment record.' });
    }
};

// --- Fast read: partition scan by username (all rows on same node) ---
exports.getPaymentHistory = async (req, res) => {
    try {
        const { username } = req.params;

        // Cassandra returns rows already sorted by timestamp DESC (defined at table level)
        const query = `
            SELECT transaction_id, restaurant, item, amount, currency, timestamp, status
            FROM ${KEYSPACE}.payment_logs
            WHERE username = ?
        `;

        const result = await client.execute(query, [username], { prepare: true });

        const history = result.rows.map(row => ({
            transactionId : row['transaction_id'],
            restaurant    : row['restaurant'],
            item          : row['item'],
            amount        : row['amount'],
            currency      : row['currency'],
            timestamp     : row['timestamp'],
            status        : row['status']
        }));

        res.status(200).json({
            message : `Payment history fetched from Apache Cassandra for user: ${username}`,
            data    : history
        });
    } catch (error) {
        console.error('Cassandra SELECT error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history.' });
    }
};