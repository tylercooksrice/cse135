// app.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "analytics_user",
  password: "CSE135powell$",
  database: "analytics"
});

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ MySQL connection established!");
    conn.release();
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err);
  }
})();

// ---------------- REST ENDPOINTS ---------------- //

// STATIC DATA
app.get("/api/static", (req, res) => {
  console.log("📡 /api/static hit");
  res.json({ message: "Static API is working" });
});

app.get("/api/static/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM static_data WHERE id = ?", [req.params.id]);
    rows.length ? res.json(rows[0]) : res.status(404).send("Not Found");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PERFORMANCE DATA
app.get("/api/performance", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM performance_data");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/performance/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM performance_data WHERE id = ?", [req.params.id]);
    rows.length ? res.json(rows[0]) : res.status(404).send("Not Found");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACTIVITY DATA
app.get("/api/activity", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM activity_data");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/activity/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM activity_data WHERE id = ?", [req.params.id]);
    rows.length ? res.json(rows[0]) : res.status(404).send("Not Found");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEBUG ALL DATA
app.get("/api/debug/all", async (req, res) => {
  try {
    const [staticData] = await db.query("SELECT * FROM static_data");
    const [performanceData] = await db.query("SELECT * FROM performance_data");
    const [activityData] = await db.query("SELECT * FROM activity_data");
    res.json({ staticData, performanceData, activityData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle analytics data
app.post("/json/analytics", async (req, res) => {
  console.log("📥 Incoming /json/analytics request");
  console.log("Request body:", req.body);

  try {
    const { page, userAgent, timestamp } = req.body;

    if (!page || !userAgent || !timestamp) {
      console.warn("⚠️ Missing required fields:", req.body);
      return res
        .status(400)
        .json({ success: false, error: "Missing fields in request body" });
    }

    const [result] = await db.execute(
      "INSERT INTO analytics (page, userAgent, timestamp) VALUES (?, ?, ?)",
      [page, userAgent, timestamp]
    );

    console.log("✅ DB insert successful:", result);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Error saving analytics:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- START SERVER ---------------- //
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
