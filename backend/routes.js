// Routes Configuration
const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();


 // HOME ROUTE

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/view", "index.html"));
});

 // IMAGES API
 // Returns 20 sample images for the gallery
router.get("/images", (req, res) => {
  res.json({
    images: [
      "http://localhost:3000/image/1.jpg",
      "http://localhost:3000/image/2.jpg",
      "http://localhost:3000/image/3.jpeg",
      "http://localhost:3000/image/4.jpg",
      "http://localhost:3000/image/5.jpg",
      "http://localhost:3000/image/6.jpg",
      "http://localhost:3000/image/7.jpg",
      "http://localhost:3000/image/8.jpg",
      "http://localhost:3000/image/9.jpeg",
      "http://localhost:3000/image/10.jpg",
      "http://localhost:3000/image/11.jpg",
      "http://localhost:3000/image/12.jpg",
      "http://localhost:3000/image/13.jpg",
      "http://localhost:3000/image/14.jpg",
      "http://localhost:3000/image/15.jpg",
      "http://localhost:3000/image/16.jpg",
      "http://localhost:3000/image/17.jpg",
      "http://localhost:3000/image/18.jpg",
      "http://localhost:3000/image/19.jpg",
      "http://localhost:3000/image/20.jpg",
    ],
  });
});

/**
 * 
 * PROPERTY DATA API
 * GET /get-property?sort={sort}&limit={limit}
 * 
 * Query Parameters:
 *   - sort: most_popular | highest_price | lowest_price (default: most_popular)
 *   - limit: number of properties to return (default: 6)
 *
 */
router.get("/get-property", (req, res) => {
  const sort = req.query.sort || "most_popular";
  const limit = parseInt(req.query.limit) || 6;

  // Map sort parameter to data file
  const fileMap = {
    most_popular: "most_popular.json",
    highest_price: "highest_price.json",
    lowest_price: "lowest_price.json",
  };

  const fileName = fileMap[sort] || "most_popular.json";
  const filePath = path.join(__dirname, "data", fileName);

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    const items = data.Result.Items.slice(0, limit);
    
    res.json({ 
      items, 
      success: true,
      sort,
      limit,
      count: items.length
    });
  } catch (err) {
    console.error("[API Error] Failed to load properties:", err.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load property data",
      sort,
      limit
    });
  }
});

/**
 * CONFIG API
 * GET /config
 * Returns frontend configuration including API keys
 */
router.get("/config", (req, res) => {
  res.json({
    success: true,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
