const mongoose = require('mongoose');

// Try a known valid DB name 'test' first, then the target one.
const uriTest = "mongodb+srv://patilritik56_db_user:ritik@cluster0.0736tyx.mongodb.net/test?appName=Cluster0";
const uriTarget = "mongodb+srv://patilritik56_db_user:ritik@cluster0.0736tyx.mongodb.net/ai-resume-builder?appName=Cluster0";

async function run() {
    try {
        console.log("--- Attempt 1: Connect to 'test' DB and insert doc ---");
        const conn1 = await mongoose.createConnection(uriTest).asPromise();
        console.log("Connected to 'test'.");
        const TestModel = conn1.model('Test', new mongoose.Schema({ name: String }));
        await TestModel.create({ name: "Probe" });
        console.log("Successfully wrote to 'test' database.");
        await conn1.close();

    } catch (err) {
        console.error("Failed to write to 'test' DB:", err.message);
    }

    try {
        console.log("\n--- Attempt 2: Connect to 'ai-resume-builder' DB and insert doc ---");
        const conn2 = await mongoose.createConnection(uriTarget).asPromise();
        console.log("Connected to 'ai-resume-builder'.");
        const TestModel2 = conn2.model('Test', new mongoose.Schema({ name: String }));
        await TestModel2.create({ name: "Probe" });
        console.log("Successfully wrote to 'ai-resume-builder' database.");
        await conn2.close();

    } catch (err) {
        console.error("Failed to write to 'ai-resume-builder' DB:", err.message);
    }

    process.exit();
}

run();
