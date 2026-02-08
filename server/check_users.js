const mongoose = require('mongoose');
const User = require('./models/User');

// Use the same URI as test_db.js
const uri = "mongodb+srv://patilritik56_db_user:ritik@cluster0.0736tyx.mongodb.net/ai-resume-builder?appName=Cluster0";

const checkUsers = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        if (users.length > 0) {
            users.forEach(u => console.log(`- User: ${u.email} (ID: ${u._id})`));
        } else {
            console.log("No users found! This explains why login fails.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

checkUsers();
