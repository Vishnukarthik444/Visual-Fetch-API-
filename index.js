const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const fetch = require("node-fetch");
const mysql = require("mysql2");

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dinosaur"));

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // put your password if any
  database: "dino_project",
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// 🚀 START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


// 🦖 DINO NAME API + STORE DATA
app.get("/dinoname", async (request, response) => {
  const startTime = Date.now();

  try {
    const fetchapi = await fetch("https://dinoipsum.com/api/?format=json&words=2&paragraphs=1");
    const data = await fetchapi.json();

    const dinoName = data[0].join(" "); // convert array → string

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // ✅ STORE IN DB
    db.query(
      `INSERT INTO dino_logs 
      (user_id, prompt, dino_name, response_time, status) 
      VALUES (?, ?, ?, ?, ?)`,
      ["user1", "random", dinoName, responseTime, "success"],
      (err) => {
        if (err) console.error("DB Insert Error:", err);
      }
    );

    response.json(data);

  } catch (error) {
    console.error("No Dinosaur Name");

    // ❌ store failure
    db.query(
      `INSERT INTO dino_logs 
      (user_id, prompt, dino_name, response_time, status) 
      VALUES (?, ?, ?, ?, ?)`,
      ["user1", "random", "error", 0, "failure"]
    );

    response.status(500).send("Error");
  }
});


// 🦕 DINO IMAGE API
app.get("/dinoimage", async (request, response) => {
  try {
    const key = "NwNGhz-9UH1AKdVJ6xTL6bzA8pE659GhVSErTtVzGaM"
    const fetchapi = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=Dinosaur&client_id=${key}`
    );

    const data = await fetchapi.json();
    const imageUrls = data.results.map((image) => image.urls.full);

    response.status(200).json({ images: imageUrls });

  } catch (error) {
    console.error("No Dinosaur Image");
    response.status(500).send("Error");
  }
});


// 📊 ANALYTICS API

// total generations
app.get("/analytics/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM dino_logs", (err, result) => {
    res.json(result);
  });
});

// average response time
app.get("/analytics/avg-time", (req, res) => {
  db.query("SELECT AVG(response_time) AS avg FROM dino_logs", (err, result) => {
    res.json(result);
  });
});

// daily usage
app.get("/analytics/daily", (req, res) => {
  db.query(
    `SELECT DATE(created_at) as day, COUNT(*) as count 
     FROM dino_logs 
     GROUP BY day`,
    (err, result) => {
      res.json(result);
    }
  );
});