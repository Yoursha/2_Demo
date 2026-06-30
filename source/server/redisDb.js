// redisDb.js
const redis = require('redis');

// Using your provided Redis Cloud credentials
const redisClient = redis.createClient({
    username: 'default',
    password: 'PF3QLvTq0SD7EDRSyM5HzlgzadmXhpx2',
    socket: {
        host: 'stocking-shake-humor-33919.db.redis.io',
        port: 18766
    }
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Successfully connected to Redis Cloud'));

const connectToRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
};

module.exports = {
    redisClient,
    connectToRedis
};