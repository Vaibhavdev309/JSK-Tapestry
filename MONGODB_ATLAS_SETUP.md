# MongoDB Atlas Setup Guide

## Fixing "user is not allowed to do action [find]" Error

This error occurs when your MongoDB Atlas database user doesn't have the necessary permissions to read/write data.

### Step 1: Check Your MongoDB Atlas User Permissions

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to **Security** → **Database Access**
3. Find your database user (the one used in your connection string)
4. Click **Edit** on that user

### Step 2: Grant Proper Permissions

You have two options:

#### Option A: Read and Write to Any Database (Recommended for Development)
1. Under **Database User Privileges**, select **Built-in Role**
2. Choose **Read and write to any database**
3. Click **Update User**

#### Option B: Custom Role (More Secure for Production)
1. Under **Database User Privileges**, select **Built-in Role**
2. Choose **readWrite** 
3. In the **Database** field, enter `tapestry` (or your database name)
4. Click **Update User**

### Step 3: Verify Connection String Format

Your `MONGODB_URI` in Render environment variables should be:

**For MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net
```

**Important Notes:**
- Do NOT include the database name in the connection string (the code will append `/tapestry`)
- Make sure the username and password are URL-encoded if they contain special characters
- The connection string should NOT have query parameters that specify a database

### Step 4: Update Render Environment Variables

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to **Environment** tab
4. Set `MONGODB_URI` to your MongoDB Atlas connection string:
   ```
   mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net
   ```
5. Make sure there's NO database name in the connection string
6. Save and redeploy

### Step 5: Verify Network Access

1. In MongoDB Atlas, go to **Security** → **Network Access**
2. Make sure your Render server IP is allowed, OR
3. Add `0.0.0.0/0` to allow all IPs (for development/testing)

### Step 6: Test the Connection

After updating permissions and redeploying, check your Render logs. You should see:
```
✅ DB Connected successfully
📊 Database: tapestry
```

If you still see permission errors, double-check:
- The username and password in the connection string match the database user
- The user has the correct permissions (readWrite or Read and write to any database)
- The database name is correct (should be `tapestry`)

## Common Issues

### Issue: "user is not allowed to do action [find] on [test.users]"
**Solution:** The user doesn't have read permissions. Grant "readWrite" or "Read and write to any database" role.

### Issue: Connection defaults to "test" database
**Solution:** Make sure your connection string doesn't have a database name, and the code will append `/tapestry` automatically.

### Issue: Authentication failed
**Solution:** 
- Verify username and password are correct
- Make sure special characters in password are URL-encoded
- Check that the user exists in MongoDB Atlas

## Security Best Practices

For production:
1. Create a dedicated database user (not the admin user)
2. Grant only `readWrite` permissions to the `tapestry` database
3. Use IP whitelisting instead of allowing all IPs (`0.0.0.0/0`)
4. Rotate passwords regularly
5. Enable MongoDB Atlas monitoring and alerts
