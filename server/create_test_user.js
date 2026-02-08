const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = "mongodb+srv://patilritik56_db_user:ritik@cluster0.0736tyx.mongodb.net/ai-resume-builder?appName=Cluster0";

const createTestUser = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const email = "test@example.com";
        const password = "password123";
        const name = "Test User";

        let user = await User.findOne({ email });
        if (user) {
            console.log("Test user already exists.");
        } else {
            user = new User({ name, email, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log("Test user created successfully!");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

createTestUser();
