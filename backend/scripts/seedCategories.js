import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import "dotenv/config";

// Categories with their subcategories
const categoriesData = [
  {
    name: "Ganesha",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  },
  {
    name: "Buddha",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  },
  {
    name: "Holi",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  },
  {
    name: "Radha",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  },
  {
    name: "Radha Krishna",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  },
  {
    name: "Hunting",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  },
  {
    name: "Lakshmi",
    subCategories: ["1X1", "1X2", "1X3", "2X1", "3X1", "3X3", "6X6"]
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB using the same logic as mongodb.js
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Handle connection string - append /tapestry if needed (same logic as mongodb.js)
    let connectionString = mongoUri.trim();
    if (connectionString.includes("mongodb+srv://") || connectionString.includes("mongodb://")) {
      const mongoUriRegex = /^((?:mongodb\+?srv?:\/\/[^/?#]+))(\/[^?#]*)?(\?.*)?$/;
      const match = mongoUriRegex.exec(connectionString);
      
      if (match) {
        const baseUrl = match[1];
        const existingDb = match[2];
        const queryParams = match[3] || "";
        
        if (!existingDb || existingDb === "/" || existingDb.trim() === "") {
          connectionString = `${baseUrl}/tapestry${queryParams}`;
        }
      }
    }

    console.log("🔵 Connecting to MongoDB...");
    console.log("📦 Connection string:", connectionString.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));
    await mongoose.connect(connectionString);
    console.log("✅ Connected to MongoDB");

    // Clear existing categories (optional - comment out if you want to keep existing)
    // await categoryModel.deleteMany({});
    // console.log("🗑️ Cleared existing categories");

    // Insert categories
    let created = 0;
    let skipped = 0;

    for (const categoryData of categoriesData) {
      try {
        // Check if category already exists
        const existing = await categoryModel.findOne({ name: categoryData.name });
        
        if (existing) {
          console.log(`⏭️  Category "${categoryData.name}" already exists, skipping...`);
          skipped++;
          
          // Update subcategories if they don't exist
          const newSubCategories = categoryData.subCategories.filter(
            sub => !existing.subCategories.includes(sub)
          );
          
          if (newSubCategories.length > 0) {
            existing.subCategories.push(...newSubCategories);
            await existing.save();
            console.log(`   ✅ Added ${newSubCategories.length} new subcategories to "${categoryData.name}"`);
          }
        } else {
          const category = new categoryModel(categoryData);
          await category.save();
          console.log(`✅ Created category "${categoryData.name}" with ${categoryData.subCategories.length} subcategories`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error processing category "${categoryData.name}":`, error.message);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Created: ${created} categories`);
    console.log(`   ⏭️  Skipped: ${skipped} categories (already exist)`);
    console.log("\n✅ Seeding completed!");

    // Display all categories
    const allCategories = await categoryModel.find({}).sort({ name: 1 });
    console.log("\n📋 All Categories in Database:");
    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.subCategories.length} subcategories)`);
      cat.subCategories.forEach(sub => console.log(`     • ${sub}`));
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
};

// Run the seed function
seedCategories();
