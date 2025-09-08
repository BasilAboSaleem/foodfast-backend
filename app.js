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
    mongoUrl: process.env.MONGO_URI,
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
//app.use(require('./routes/coreRoute'));
//app.use(require('./routes/authRoute'));


// Connect DB + Start server
const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => console.log(err));
