import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Handle connection string - if it already has a database name, use it; otherwise append /tapestry
    let connectionString = mongoUri.trim();
    
    // If it's a MongoDB Atlas connection string (mongodb+srv://) or standard connection string
    // and doesn't already have a database name, append it
    if (connectionString.includes("mongodb+srv://") || connectionString.includes("mongodb://")) {
      // Check if database name is already in the connection string
      const dbNameRegex = /\/[^/?]+(\?|$)/;
      const hasDatabase = dbNameRegex.exec(connectionString);
      
      if (!hasDatabase) {
        // No database specified, append /tapestry
        // Handle query parameters
        if (connectionString.includes("?")) {
          connectionString = connectionString.replace("?", "/tapestry?");
        } else {
          connectionString = connectionString.endsWith("/") 
            ? `${connectionString}tapestry` 
            : `${connectionString}/tapestry`;
        }
      }
    }

    console.log("🔵 Connecting to MongoDB...");
    console.log("📦 Connection string:", connectionString.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide credentials in logs
    
    mongoose.connection.on("connected", () => {
      console.log("✅ DB Connected successfully");
      console.log("📊 Database:", mongoose.connection.db.databaseName);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    if (error.message.includes("not allowed to do action")) {
      console.error("⚠️ PERMISSIONS ERROR: Your MongoDB Atlas user doesn't have proper permissions.");
      console.error("📝 Solution: Go to MongoDB Atlas → Database Access → Edit your user → Set permissions to 'Read and write to any database'");
    }
    throw error;
  }
};

export default connectDB;
