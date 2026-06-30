const { getDb } = require('../db');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const db = getDb();
        const usersCollection = db.collection('users');

        // 1. Check if the user already exists in the database
        const existingUser = await usersCollection.findOne({ username: username });

        if (existingUser) {
            // 2a. User exists: Validate the plain text password
            if (existingUser.password !== password) {
                return res.status(401).json({ error: "Invalid password" });
            }

            // Update the last login timestamp
            await usersCollection.updateOne(
                { _id: existingUser._id },
                { $set: { lastLogin: new Date() } }
            );

            return res.status(200).json({
                message: "Login successful",
                user: { username: existingUser.username } // Don't send the password back to the client
            });

        } else {
            // 2b. User doesn't exist: Create a new account for the demo
            const newUser = {
                username: username,
                password: password, // Stored in plain text for demo purposes
                createdAt: new Date(),
                lastLogin: new Date()
            };

            await usersCollection.insertOne(newUser);

            return res.status(201).json({
                message: "Account created and logged in successfully",
                user: { username: newUser.username }
            });
        }

    } catch (error) {
        console.error("Database error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
};