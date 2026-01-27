import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import { Server } from "socket.io";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatRouter from "./routes/chatRoute.js";
import messageRouter from "./routes/messageRoute.js";
import priceRequestRouter from "./routes/priceRequestRouter.js";
import paymentRouter from "./routes/paymentRoute.js";
import contactRouter from "./routes/contactRoute.js";
import adminRouter from "./routes/adminRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import messageModel from "./models/messageModel.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost on any port for easier local development
    if (process.env.NODE_ENV !== "production") {
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
    }
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5174", // Frontend
      "http://localhost:5173", // Frontend (alternative port)
      "http://localhost:5175", // Admin panel
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5175", // Admin panel (alternative)
    ].filter(Boolean); // Remove undefined values
    
    // In production, also allow Vercel preview and production URLs
    if (process.env.NODE_ENV === "production") {
      // Allow any Vercel deployment
      if (origin.includes("vercel.app") || origin.includes("vercel.com")) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
};

app.use(cors(corsOptions));

// Register routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/price-requests", priceRequestRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);
app.use("/api/category", categoryRouter);

// Log registered routes on startup
console.log("✅ Routes registered:");
console.log("  - /api/user (profile, change-password, address management)");
console.log("  - /api/product");
console.log("  - /api/cart");
console.log("  - /api/order");
console.log("  - /api/chat");
console.log("  - /api/message");
console.log("  - /api/price-requests");
console.log("  - /api/payment (razorpay create-order, verify, key)");
console.log("  - /api/contact (submit, admin: list, update, delete)");
console.log("  - /api/admin (counts)");
console.log("  - /api/category (list, create, update, delete, manage subcategories)");

app.get("/", (req, res) => {
  res.send("API working");
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log("🚀 Server started on port : " + port);
  console.log("📡 Server accessible at: http://localhost:" + port);
  console.log("🌐 API endpoint: http://localhost:" + port + "/api");
});

// Socket.IO CORS configuration
const socketCorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // In development, allow localhost on any port for easier local development
    if (process.env.NODE_ENV !== "production") {
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5174", // Frontend
      "http://localhost:5173", // Frontend (alternative port)
      "http://localhost:5175", // Admin panel
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5175", // Admin panel (alternative)
    ].filter(Boolean);
    
    // In production, allow Vercel deployments
    if (process.env.NODE_ENV === "production") {
      if (origin.includes("vercel.app") || origin.includes("vercel.com")) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  pingTimeout: 60000,
  cors: socketCorsOptions,
});

io.on("connection", (socket) => {
  console.log("Socket connected: " + socket.id);

  socket.on("setup", (userData) => {
    if (userData._id === "admin") {
      socket.join("admin");
    } else {
      socket.join(userData._id);
    }
    socket.emit("connection");
  });

  socket.on("join chat", (room) => {
    if (room) {
      socket.join(String(room));
      console.log("User joined chat room: " + room);
    }
  });

  socket.on("new Message", async (newMessageReceived) => {
    const msg = newMessageReceived.message;
    if (!msg || !msg.chatId) return;
    const room = String(msg.chatId);
    const sender = msg.sender;

    io.to(room).emit("message received", msg);

    // Recipient's unread = messages from sender (the other party) with read:false
    let count = 0;
    try {
      count = await messageModel.countDocuments({
        chatId: msg.chatId,
        sender,
        read: false,
      });
    } catch (e) {
      console.error("unread count:", e?.message);
    }
    const payload = { chatId: room, count };

    if (sender === "user") {
      io.to("admin").emit("unread update", payload);
    } else {
      io.to(room).emit("unread update", payload);
    }
  });

  socket.on("typing", (chatId) => {
    if (chatId) socket.to(String(chatId)).emit("typing");
  });

  socket.on("stop typing", (chatId) => {
    if (chatId) socket.to(String(chatId)).emit("stop typing");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected: " + socket.id);
  });
});
