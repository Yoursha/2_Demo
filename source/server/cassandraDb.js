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
    } catch (err) {
        console.error('❌ Cassandra connection error:', err.message);
        throw err;
    }
};

module.exports = { client, connectToCassandra, KEYSPACE };
