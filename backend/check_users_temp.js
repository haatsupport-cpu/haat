import "./env.js";
import mongoose from "mongoose";
import User from "./models/User.js";

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  if (!mongoUri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }
  console.log("Connecting to database...");
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");
    
    const count = await User.countDocuments();
    console.log(`\nFound ${count} users in the database.`);
    
    if (count > 0) {
      const users = await User.find().lean();
      console.log("\nUsers in database:");
      for (const u of users) {
        console.log(` - Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, CreatedAt: ${u.createdAt}`);
      }
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
