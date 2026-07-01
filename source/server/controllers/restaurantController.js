const { redisClient } = require('../redisDb');

// --- 1. Get All Restaurants ---
exports.getAllRestaurants = async (req, res) => {
    try {
        // Keeping the 'all' key namespaced under 'restaurants'
        const cachedData = await redisClient.get('restaurants:all');

        if (cachedData) {
            console.log("Serving all restaurants from Redis Cache");
            return res.status(200).json(JSON.parse(cachedData));
        }

        console.log("Redis cache empty, seeding restaurants...");

        const defaultRestaurants = [
            { id: 'r1', name: 'Phở Hòa', type: 'Vietnamese' },
            { id: 'r2', name: 'Pizza 4P\'s', type: 'Italian' }
        ];

        // Save the master list
        await redisClient.set('restaurants:all', JSON.stringify(defaultRestaurants));

        // Seed individual restaurant keys using your new convention: restaurants:{id}
        for (const rest of defaultRestaurants) {
            await redisClient.set(`restaurants:${rest.id}`, JSON.stringify(rest));
        }

        res.status(200).json(defaultRestaurants);

    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ error: "Server error retrieving restaurants" });
    }
};

// --- 2. Get Single Restaurant By ID ---
exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        // Using your exact naming convention: restaurants:{id}
        const redisKey = `restaurants:${id}`;

        const cachedRestaurant = await redisClient.get(redisKey);

        if (cachedRestaurant) {
            console.log(`Serving restaurant profile ${id} from Redis Cache`);
            return res.status(200).json(JSON.parse(cachedRestaurant));
        }

        res.status(404).json({ error: "Restaurant not found in cache. Please fetch all restaurants first to seed." });

    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ error: "Server error retrieving restaurant profile" });
    }
};

// --- 3. Get Menu for a Specific Restaurant ---
exports.getRestaurantMenu = async (req, res) => {
    try {
        const { id } = req.params;
        // Using your exact naming convention: restaurants:{id}:menu
        const redisKey = `restaurants:${id}:menu`;

        const cachedMenu = await redisClient.get(redisKey);

        if (cachedMenu) {
            console.log(`Serving menu for ${id} from Redis Cache using key: ${redisKey}`);
            return res.status(200).json(JSON.parse(cachedMenu));
        }

        console.log(`Redis cache empty for ${redisKey}, seeding...`);

        const defaultMenus = {
            'r1': [{ id: 'm1', name: 'Phở Đặc Biệt', price: 65000 }, { id: 'm2', name: 'Trà Đá', price: 5000 }],
            'r2': [{ id: 'm3', name: 'Burrata Margherita', price: 250000 }, { id: 'm4', name: 'Crab Pasta', price: 180000 }]
        };

        const menuToReturn = defaultMenus[id];

        if (!menuToReturn) {
            return res.status(404).json({ error: "Menu not found" });
        }

        // Save to Redis using the hierarchical key
        await redisClient.set(redisKey, JSON.stringify(menuToReturn));

        res.status(200).json(menuToReturn);

    } catch (error) {
        console.error("Redis Error:", error);
        res.status(500).json({ error: "Server error retrieving menu" });
    }
};