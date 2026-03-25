const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const mysql = require("mysql2");

// 🔐 ENV CONFIG (IMPORTANT)
require("dotenv").config();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dinosaur"));

// ✅ PORT FIX (VERY IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 3000;


// =======================
// 🗄️ DATABASE CONNECTION
// =======================

// ⚠️ TEMP: keep local for now (will change to cloud later)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dino_project",
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});


// =======================
// 🦖 DINO NAME API
// =======================

app.get("/dinoname", async (req, res) => {
  const startTime = Date.now();

  try {
    const fetchapi = await fetch(
      "https://dinoipsum.com/api/?format=json&words=2&paragraphs=1"
    );

    const data = await fetchapi.json();
    const dinoName = data[0].join(" ");

    const responseTime = Date.now() - startTime;

    // ✅ store (ignore error if DB fails in production)
    db.query(
      `INSERT INTO dino_logs 
      (user_id, prompt, dino_name, response_time, status) 
      VALUES (?, ?, ?, ?, ?)`,
      ["user1", "random", dinoName, responseTime, "success"],
      (err) => {
        if (err) console.error("DB Insert Error:", err.message);
      }
    );

    res.json(data);

  } catch (error) {
    console.error("❌ Dino API error:", error.message);

    db.query(
      `INSERT INTO dino_logs 
      (user_id, prompt, dino_name, response_time, status) 
      VALUES (?, ?, ?, ?, ?)`,
      ["user1", "random", "error", 0, "failure"]
    );

    res.status(500).json({ error: "Failed to fetch dinosaur" });
  }
});


// =======================
// 🦕 DINO IMAGE API
// =======================

app.get("/dinoimage", async (req, res) => {
  try {
    const key = process.env.UNSPLASH_KEY;

    const fetchapi = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=dinosaur&client_id=${key}`
    );

    const data = await fetchapi.json();

    const imageUrls = data.results.map((img) => img.urls.full);

    res.json({ images: imageUrls });

  } catch (error) {
    console.error("❌ Image API error:", error.message);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});


// =======================
// 📊 ANALYTICS API
// =======================

app.get("/analytics/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM dino_logs", (err, result) => {
    if (err) return res.json([{ total: 0 }]);
    res.json(result);
  });
});

app.get("/analytics/avg-time", (req, res) => {
  db.query("SELECT AVG(response_time) AS avg FROM dino_logs", (err, result) => {
    if (err) return res.json([{ avg: 0 }]);
    res.json(result);
  });
});

app.get("/analytics/daily", (req, res) => {
  db.query(
    `SELECT DATE(created_at) as day, COUNT(*) as count 
     FROM dino_logs 
     GROUP BY day`,
    (err, result) => {
      if (err) return res.json([]);
      res.json(result);
    }
  );
});


// =======================
// 🚀 START SERVER
// =======================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});