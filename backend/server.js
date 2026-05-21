require("dotenv").config();
const express = require("express");
const path = require("path");

// Import routes
const routes = require("./routes");

// Express App Setup
const app = express();

// CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Static Files Middleware
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../frontend/public")));


// API Routes
app.use(routes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({ 
    success: false, 
    error: "Internal server error" 
  });
});


// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found",
    path: req.path
  });
});


// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server Running on http://localhost:${PORT}`);
  console.log(`✓ Press Ctrl+C to stop`);
});