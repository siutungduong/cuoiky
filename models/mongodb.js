const mongoose = require('mongoose');

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(process.env.MONGO_URL || "mongodb://mongo:27017/crud_project");
            console.log("MongoDB connected");
        } catch (error) {
            console.error("MongoDB connection failed:", error);
            process.exit(1);
        }
    } else {
        console.log("MongoDB connection already active");
    }
};

module.exports = connectDB;

