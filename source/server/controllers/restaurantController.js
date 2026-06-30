// controllers/restaurantController.js
const { redisClient } = require('../redisDb');

exports.getAllRestaurants = async (req, res) => {
    try {
        // Attempt to fetch from Redis Cache
        const cachedData = await redisClient.get('restaurants:all');

        if (cachedData) {
            console.log("Serving restaurants from Redis Cache");
            return res.status(200).json(JSON.parse(cachedData));
        }

        // --- Seeding Logic for Demo ---
        // If Redis is empty, we define the data, send it to the client, 
        // AND save it to Redis for all future requests.
        console.log("Redis cache empty, seeding restaurants...");

        const defaultRestaurants = [
            { id: 'r1', name: 'Phở Hòa', type: 'Vietnamese' },
            { id: 'r2', name: 'Pizza 4P\'s', type: 'Italian' }
        ];

        // Save to Redis (no expiration for this demo so it stays populated)
        await redisClient.set('restaurants:all', JSON.stringify(defaultRestaurants));

        res.status(200).json(defaultRestaurants);

    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ error: "Server error retrieving restaurants" });
    }
};

exports.getRestaurantMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const redisKey = `menu:${id}`;

        // Attempt to fetch from Redis
        const cachedMenu = await redisClient.get(redisKey);

        if (cachedMenu) {
            console.log(`Serving menu ${id} from Redis Cache`);
            return res.status(200).json(JSON.parse(cachedMenu));
        }

        // --- Seeding Logic for Demo ---
        console.log(`Redis cache empty for menu ${id}, seeding...`);

        const defaultMenus = {
            'r1': [{ id: 'm1', name: 'Phở Đặc Biệt', price: 65000 }, { id: 'm2', name: 'Trà Đá', price: 5000 }],
            'r2': [{ id: 'm3', name: 'Burrata Margherita', price: 250000 }, { id: 'm4', name: 'Crab Pasta', price: 180000 }]
        };

        const menuToReturn = defaultMenus[id];

        if (!menuToReturn) {
            return res.status(404).json({ error: "Menu not found" });
        }

        // Save to Redis
        await redisClient.set(redisKey, JSON.stringify(menuToReturn));

        res.status(200).json(menuToReturn);

    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ error: "Server error retrieving menu" });
    }
};