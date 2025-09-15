const express = require("express");
const app = express();
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require("path");
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static + views
app.set("view engine", "ejs");
app.use(express.static("public"));

// Extra middleware
app.use(cookieParser());
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  } else if (req.query && '_method' in req.query) {
    return req.query._method;
  }
}));

// Session & flash
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.use(flash());

// Expose flash globally
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Middleware placeholders
app.use(require('./middlewares/authMiddlewares').checkIfUser);

// Routers
app.use(require('./routes/authRoute'));
app.use(require('./routes/productRoute'));
app.use(require('./routes/orderRoute'));
app.use(require("./routes/chatRoute"));
app.use(require('./routes/announcementRoutes'));


app.get("/test-orders", (req, res) => {
  res.render("testOrders");
});

app.get("/test-driver-location", (req, res) => {
  res.render("testDriverLocation");
});

app.get("/test-chat", (req, res) => {
  res.render("testChat");
});

app.get("/test-announcements", (req, res) => {
  res.render("testAnnouncements");
}) 
// Connect DB + Start server with Socket.io
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

// Make io accessible in controllers
app.set("io", io);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`✅ ${socket.id} joined chat room chat:${chatId}`);
  });

  // Send message
  socket.on("sendMessage", async ({ chatId, sender, message }) => {
    // Save message in DB
    const ChatMessage = require("./models/ChatMessage");
    const newMessage = new ChatMessage({ chatId, sender, message });
    await newMessage.save();

    // Broadcast to chat room
    io.to(`chat:${chatId}`).emit("newMessage", newMessage);
  });

  // Typing indicator
  socket.on("typing", ({ chatId, sender }) => {
    socket.to(`chat:${chatId}`).emit("typing", { sender });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const { sub } = require("./config/redis");

// Redis Subscriber
sub.subscribe("orderChannel");

sub.on("message", (channel, message) => {
  if (channel === "orderChannel") {
    const order = JSON.parse(message);
    io.emit("newOrder", order); 
  }
});


// Announcements namespace
const Announcement = require("./models/Announcement");

const annNs = io.of("/announcements");

annNs.on("connection", (socket) => {
  console.log("📢 Client connected to /announcements:", socket.id);

  // audience joining (customers, drivers, restaurants, all)
  socket.on("join_audience", (audience) => {
    const valid = ["all", "customers", "drivers", "restaurants"];
    if (valid.includes(audience)) {
      socket.join(audience);
      console.log(`✅ ${socket.id} joined announcements audience: ${audience}`);
    }
  });

  // client requests recent announcements
  socket.on("get_recent", async (limit = 10) => {
    const recent = await Announcement.find({})
      .sort({ pinned: -1, createdAt: -1 })
      .limit(Math.min(limit, 50))
      .lean();
    socket.emit("announcement:recent", recent);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected from /announcements:", socket.id);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => console.log(err));
