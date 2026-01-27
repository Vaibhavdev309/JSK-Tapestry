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
      // Use regex to parse MongoDB connection string
      // Format: mongodb+srv://user:pass@host:port/database?options
      // Match groups: [1]=protocol+credentials+host, [2]=/database or /, [3]=?options (optional)
      const mongoUriRegex = /^((?:mongodb\+?srv?:\/\/[^/?#]+))(\/[^?#]*)?(\?.*)?$/;
      const match = mongoUriRegex.exec(connectionString);
      
      if (match) {
        const baseUrl = match[1]; // mongodb+srv://user:pass@host
        const existingDb = match[2]; // /database, /, or undefined
        const queryParams = match[3] || ""; // ?options or ""
        
        // Check if database is already specified
        // existingDb will be like "/database" if present, "/" if just a slash, or undefined if not
        // We need to add database name if: undefined, "/", or empty string
        if (!existingDb || existingDb === "/" || existingDb.trim() === "") {
          // No database specified, add /tapestry
          connectionString = `${baseUrl}/tapestry${queryParams}`;
        }
        // If existingDb has a value (and it's not just "/"), database is already specified
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
