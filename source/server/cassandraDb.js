// cassandraDb.js
// Column-Family NoSQL database for append-heavy payment logs
const cassandra = require('cassandra-driver');
require('dotenv').config();

const CONTACT_POINTS = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
const LOCAL_DC       = process.env.CASSANDRA_DATACENTER || 'datacenter1';
const KEYSPACE       = 'payment_demo';

// Connect without keyspace first — we need to CREATE it before using it
const client = new cassandra.Client({
    contactPoints: CONTACT_POINTS,
    localDataCenter: LOCAL_DC,
});

const connectToCassandra = async () => {
    try {
        await client.connect();

        // 1. Create keyspace (column-family equivalent of a database)
        await client.execute(`
            CREATE KEYSPACE IF NOT EXISTS ${KEYSPACE}
            WITH replication = {
                'class'              : 'SimpleStrategy',
                'replication_factor' : 1
            }
        `);

        // 2. Create payment_logs table
        //    Partition key  : username  → all rows for one user live on the same node
        //    Clustering key : timestamp → rows within a partition are sorted newest-first
        //    This is the classic Column-Family pattern for time-series / event logs
        await client.execute(`
            CREATE TABLE IF NOT EXISTS ${KEYSPACE}.payment_logs (
                username       TEXT,
                timestamp      TIMESTAMP,
                transaction_id TEXT,
                restaurant     TEXT,
                item           TEXT,
                amount         DECIMAL,
                currency       TEXT,
                status         TEXT,
                PRIMARY KEY (username, timestamp)
            ) WITH CLUSTERING ORDER BY (timestamp DESC)
        `);

        console.log('✅ Successfully connected to Apache Cassandra');
        console.log(`   Keyspace : ${KEYSPACE}`);
        console.log(`   Table    : payment_logs  (partition: username | cluster: timestamp DESC)`);

        // 3. Seed demo data only if the table is empty
        await seedDemoData();
    } catch (err) {
        console.error('❌ Cassandra connection error:', err.message);
        throw err;
    }
};

// Demo payment records — inserted once at startup when table is empty
const DEMO_PAYMENTS = [
    { username: 'nam.do', transactionId: 'TXN-DEMO001', restaurant: 'Phở Hòa',    item: 'Phở Đặc Biệt',      amount: 65000,  currency: 'VND', timestamp: new Date('2026-06-30T08:20:00Z'), status: 'SUCCESS' },
    { username: 'nam.do', transactionId: 'TXN-DEMO002', restaurant: "Pizza 4P's",  item: 'Burrata Margherita', amount: 250000, currency: 'VND', timestamp: new Date('2026-06-30T12:05:00Z'), status: 'SUCCESS' },
    { username: 'nam.do', transactionId: 'TXN-DEMO003', restaurant: 'Phở Hòa',    item: 'Trà Đá',             amount: 5000,   currency: 'VND', timestamp: new Date('2026-07-01T07:45:00Z'), status: 'SUCCESS' },
    { username: 'nam.do', transactionId: 'TXN-DEMO004', restaurant: "Pizza 4P's",  item: 'Crab Pasta',         amount: 180000, currency: 'VND', timestamp: new Date('2026-07-01T19:30:00Z'), status: 'SUCCESS' },
    { username: 'nam.do', transactionId: 'TXN-DEMO005', restaurant: 'Phở Hòa',    item: 'Phở Đặc Biệt',      amount: 65000,  currency: 'VND', timestamp: new Date('2026-07-02T08:10:00Z'), status: 'SUCCESS' },
    { username: 'nam.do', transactionId: 'TXN-DEMO006', restaurant: "Pizza 4P's",  item: 'Burrata Margherita', amount: 250000, currency: 'VND', timestamp: new Date('2026-07-03T11:55:00Z'), status: 'SUCCESS' },

    { username: 'admin',      transactionId: 'TXN-DEMO007', restaurant: "Pizza 4P's",  item: 'Crab Pasta',         amount: 180000, currency: 'VND', timestamp: new Date('2026-07-01T13:00:00Z'), status: 'SUCCESS' },
    { username: 'admin',      transactionId: 'TXN-DEMO008', restaurant: 'Phở Hòa',    item: 'Trà Đá',             amount: 5000,   currency: 'VND', timestamp: new Date('2026-07-02T09:30:00Z'), status: 'SUCCESS' },
    { username: 'admin',      transactionId: 'TXN-DEMO009', restaurant: 'Phở Hòa',    item: 'Phở Đặc Biệt',      amount: 65000,  currency: 'VND', timestamp: new Date('2026-07-03T07:20:00Z'), status: 'SUCCESS' },
];

const seedDemoData = async () => {
    // Cassandra INSERT is an upsert on primary key (username, timestamp).
    // Using fixed timestamps means re-running on restart is fully idempotent — no duplicates.
    const insertQuery = `
        INSERT INTO ${KEYSPACE}.payment_logs
            (username, timestamp, transaction_id, restaurant, item, amount, currency, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const p of DEMO_PAYMENTS) {
        await client.execute(insertQuery, [
            p.username, p.timestamp, p.transactionId,
            p.restaurant, p.item, p.amount, p.currency, p.status
        ], { prepare: true });
    }

    console.log(`Seeded ${DEMO_PAYMENTS.length} demo payment records into Cassandra.`);
};

module.exports = { client, connectToCassandra, KEYSPACE };
