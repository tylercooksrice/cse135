// app.js
const express = require("express");
const cors = require("cors");
app.use(cors({
  origin: "https://reporting.akhils.site"
}));
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
app.get("/api/static", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM static_data");
    res.json(rows);
    console.log("testcase1");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// ---------------- Handle analytics data ---------------- //
app.post("/json/analytics", async (req, res) => {
  const { sessionId, static, performance, activity } = req.body;

  console.log("📥 Incoming /json/analytics payload:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
      // ---------------- Static Data ---------------- //
      if (static) {
          try {
              const [result] = await db.query(
                  `INSERT INTO static_data 
                  (session_id, userAgent, language, cookieEnabled, javaScriptEnabled, imagesEnabled, cssEnabled,
                   screenWidth, screenHeight, colorDepth, windowWidth, windowHeight, connectionType, onlineStatus,
                   pageUrl, pagePath, referrer)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                      sessionId,
                      static.userAgent,
                      static.language,
                      static.cookieEnabled,
                      static.javaScriptEnabled,
                      static.imagesEnabled,
                      static.cssEnabled,
                      static.screenDimensions.width,
                      static.screenDimensions.height,
                      static.screenDimensions.colorDepth,
                      static.windowDimensions.width,
                      static.windowDimensions.height,
                      static.connectionType,
                      static.onlineStatus,
                      static.page.url,
                      static.page.path,
                      static.page.referrer
                  ]
              );
              console.log(" Static data inserted:", result);
          } catch (err) {
              console.error(" Failed inserting static data:", err.message);
          }
      } else {
          console.warn(" No static data received.");
      }

      // ---------------- Performance Data ---------------- //
      if (performance) {
          try {
              const [result] = await db.query(
                  `INSERT INTO performance_data
                  (session_id, pagePath, loadTime, domInteractive, domContentLoaded, collectedAt)
                  VALUES (?, ?, ?, ?, ?, ?)`,
                  [
                      sessionId,
                      performance.page.path,
                      performance.navigation?.loadTime || performance.totalLoadTime || 0,
                      performance.navigation?.domInteractive || 0,
                      performance.navigation?.domContentLoaded || 0,
                      performance.collectedAt || Date.now()
                  ]
              );
              console.log(" Performance data inserted:", result);
          } catch (err) {
              console.error(" Failed inserting performance data:", err.message);
          }
      } else {
          console.warn(" No performance data received.");
      }

      // ---------------- Activity Data ---------------- //
      if (activity && activity.length > 0) {
          console.log(` ${activity.length} activity rows received.`);
          for (const a of activity) {
              try {
                  const [result] = await db.query(
                      `INSERT INTO activity_data (session_id, event, details, ts)
                       VALUES (?, ?, ?, ?)`,
                      [sessionId, a.type, JSON.stringify(a), a.timestamp]
                  );
                  console.log(` Activity inserted (${a.type})`, result);
              } catch (err) {
                  console.error(` Failed inserting activity (${a.type}):`, err.message);
              }
          }
      } else {
          console.warn(" No activity data received.");
      }

      res.status(200).json({ message: "Analytics data received successfully" });
  } catch (err) {
      console.error(" Error saving analytics:", err);
      res.status(500).json({ error: "Failed to save analytics" });
  }
});


// ---------------- START SERVER ---------------- //
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
