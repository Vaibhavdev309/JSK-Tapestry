# Seed Categories to Database

This guide will help you add existing categories and subcategories to your database.

## Method 1: Using the Seed Script (Recommended)

### Step 1: Make sure your backend is set up
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Make sure your `.env` file has the correct `MONGODB_URI`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
   ```

### Step 2: Run the seed script
```bash
npm run seed:categories
```

This will:
- ✅ Create all 7 categories (Ganesha, Buddha, Holi, Radha, Radha Krishna, Hunting, Lakshmi)
- ✅ Add all subcategories (1X1, 1X2, 1X3, 2X1, 3X1, 3X3, 6X6) to each category
- ✅ Skip categories that already exist
- ✅ Add missing subcategories to existing categories

### Expected Output:
```
🔵 Connecting to MongoDB...
✅ Connected to MongoDB
✅ Created category "Ganesha" with 7 subcategories
✅ Created category "Buddha" with 7 subcategories
...
📊 Summary:
   ✅ Created: 7 categories
   ⏭️  Skipped: 0 categories (already exist)
```

---

## Method 2: Manual Addition via Admin Panel

If you prefer to add categories manually:

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start your admin panel:**
   ```bash
   cd admin
   npm run dev
   ```

3. **Login to admin panel** at `http://localhost:5175`

4. **Go to Categories page** (click "Categories" in sidebar)

5. **Add Categories:**
   - Click "+ Add Category"
   - Enter category name: `Ganesha`
   - Click "Add"
   - Repeat for: `Buddha`, `Holi`, `Radha`, `Radha Krishna`, `Hunting`, `Lakshmi`

6. **Add Subcategories:**
   - Click "+ Add Subcategory"
   - Select a category (e.g., "Ganesha")
   - Enter subcategory: `1X1`
   - Click "Add"
   - Repeat for all subcategories: `1X2`, `1X3`, `2X1`, `3X1`, `3X3`, `6X6`
   - Repeat this process for each category

---

## Categories and Subcategories to Add

### Categories:
1. Ganesha
2. Buddha
3. Holi
4. Radha
5. Radha Krishna
6. Hunting
7. Lakshmi

### Subcategories (for each category):
1. 1X1
2. 1X2
3. 1X3
4. 2X1
5. 3X1
6. 3X3
7. 6X6

**Total:** 7 categories × 7 subcategories = 49 category-subcategory combinations

---

## Troubleshooting

### Error: MONGODB_URI not set
- Make sure your `.env` file exists in the `backend` directory
- Check that `MONGODB_URI` is correctly set

### Error: Cannot connect to MongoDB
- Verify your MongoDB connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your MongoDB cluster is running

### Categories already exist
- The script will skip existing categories
- It will add missing subcategories to existing categories
- No data will be lost

---

## Verify Categories

After seeding, you can verify by:

1. **Check Admin Panel:**
   - Go to Categories page
   - You should see all 7 categories
   - Each should have 7 subcategories

2. **Check via API:**
   ```bash
   curl http://localhost:4000/api/category/list
   ```

3. **Check MongoDB:**
   - Connect to your MongoDB database
   - Check the `categories` collection
   - You should see 7 documents

---

## Notes

- The seed script is **safe to run multiple times**
- It won't duplicate existing categories
- It will add missing subcategories to existing categories
- No existing data will be deleted
