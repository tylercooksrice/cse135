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

// ---------------- REST ENDPOINTS ---------------- //

// STATIC DATA
app.get("/api/static", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM static_data");
    res.json(rows);
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

// ---------------- COLLECTOR ROUTE ---------------- //
app.post("/json/analytics", async (req, res) => {
  try {
    const { sessionId, static: staticBlock, performance: perfBlock, activity: activities } = req.body || {};

    console.log("Incoming analytics data:", req.body);

    // Insert static data
    if (staticBlock && Object.keys(staticBlock).length) {
      try {
        await db.query(
          `INSERT INTO static_data 
            (session_id, userAgent, language, cookieEnabled, javaScriptEnabled, imagesEnabled, cssEnabled, 
             screenWidth, screenHeight, colorDepth, windowWidth, windowHeight, connectionType, onlineStatus, pageUrl, pagePath, referrer)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            staticBlock.userAgent || null,
            staticBlock.language || null,
            !!staticBlock.cookieEnabled,
            !!staticBlock.javaScriptEnabled,
            !!staticBlock.imagesEnabled,
            !!staticBlock.cssEnabled,
            staticBlock.screenDimensions?.width || null,
            staticBlock.screenDimensions?.height || null,
            staticBlock.screenDimensions?.colorDepth || null,
            staticBlock.windowDimensions?.width || null,
            staticBlock.windowDimensions?.height || null,
            staticBlock.connectionType || null,
            !!staticBlock.onlineStatus,
            staticBlock.page?.url || null,
            staticBlock.page?.path || null,
            staticBlock.page?.referrer || null
          ]
        );
        console.log("Inserted static data for session:", sessionId);
      } catch (err) {
        console.error("Static data insert failed:", err);
      }
    }

    // Insert performance data
    if (perfBlock && Object.keys(perfBlock).length) {
      try {
        await db.query(
          `INSERT INTO performance_data 
            (session_id, pagePath, loadTime, domInteractive, domContentLoaded, collectedAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            perfBlock.page?.path || "unknown",
            perfBlock.navigation?.loadTime || null,
            perfBlock.navigation?.domInteractive || null,
            perfBlock.navigation?.domContentLoaded || null,
            perfBlock.collectedAt || Date.now()
          ]
        );
        console.log("Inserted performance data for session:", sessionId);
      } catch (err) {
        console.error("Performance data insert failed:", err);
      }
    }

    // Insert activity data
    if (Array.isArray(activities) && activities.length) {
      for (const a of activities) {
        try {
          await db.query(
            `INSERT INTO activity_data (session_id, event, details, ts)
             VALUES (?, ?, ?, ?)`,
            [
              sessionId,
              a.type || "unknown",
              JSON.stringify(a),
              a.timestamp || Date.now()
            ]
          );
        } catch (err) {
          console.error("Activity insert failed:", err, a);
        }
      }
      console.log(`Inserted ${activities.length} activity events for session:`, sessionId);
    }

    res.status(202).json({ ok: true });
  } catch (err) {
    console.error("Error saving analytics:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------- DEBUG ---------------- //
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

// ---------------- START SERVER ---------------- //
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
