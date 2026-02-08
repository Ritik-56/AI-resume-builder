const mongoose = require('mongoose');

// Try with underscores
const uriTarget = "mongodb+srv://patilritik56_db_user:ritik@cluster0.0736tyx.mongodb.net/ai_resume_builder?appName=Cluster0";

async function run() {
    try {
        console.log("--- Attempt: Connect to 'ai_resume_builder' DB and insert doc ---");
        const conn = await mongoose.createConnection(uriTarget).asPromise();
        console.log("Connected to 'ai_resume_builder'.");
        const TestModel = conn.model('Test', new mongoose.Schema({ name: String }));
        await TestModel.create({ name: "Probe" });
        console.log("Successfully wrote to 'ai_resume_builder' database.");
        await conn.close();

    } catch (err) {
        console.error("Failed to write to 'ai_resume_builder' DB:", err.message);
    }
    process.exit();
}

run();
