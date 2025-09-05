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

// Handle analytics data
app.post("/json/analytics", async (req, res) => {
  const { session_id, staticBlock, perfBlock, activities } = req.body;

  console.log(" Incoming /json/analytics payload:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Insert static data
    if (staticBlock) {
      try {
        const [result] = await db.query(
          `INSERT INTO static_data 
          (session_id, userAgent, language, cookieEnabled, javaScriptEnabled, imagesEnabled, cssEnabled, screenWidth, screenHeight, colorDepth, windowWidth, windowHeight, connectionType, onlineStatus, pageUrl, pagePath, referrer) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            session_id,
            staticBlock.userAgent,
            staticBlock.language,
            staticBlock.cookieEnabled,
            staticBlock.javaScriptEnabled,
            staticBlock.imagesEnabled,
            staticBlock.cssEnabled,
            staticBlock.screenWidth,
            staticBlock.screenHeight,
            staticBlock.colorDepth,
            staticBlock.windowWidth,
            staticBlock.windowHeight,
            staticBlock.connectionType,
            staticBlock.onlineStatus,
            staticBlock.pageUrl,
            staticBlock.pagePath,
            staticBlock.referrer,
          ]
        );
        console.log("✅ Static data inserted:", result);
      } catch (err) {
        console.error("❌ Failed inserting static data:", err.message);
      }
    } else {
      console.warn("⚠️ No staticBlock received.");
    }

    // Insert performance data
    if (perfBlock) {
      try {
        const [result] = await db.query(
          `INSERT INTO performance_data 
          (session_id, pagePath, loadTime, domInteractive, domContentLoaded, collectedAt) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            session_id,
            perfBlock.pagePath,
            perfBlock.loadTime,
            perfBlock.domInteractive,
            perfBlock.domContentLoaded,
            perfBlock.collectedAt,
          ]
        );
        console.log("✅ Performance data inserted:", result);
      } catch (err) {
        console.error("❌ Failed inserting performance data:", err.message);
      }
    } else {
      console.warn("⚠️ No perfBlock received.");
    }

    // Insert activity data
    if (activities && activities.length > 0) {
      console.log(`📊 ${activities.length} activity rows received.`);
      for (const a of activities) {
        try {
          const [result] = await db.query(
            `INSERT INTO activity_data (session_id, event, details, ts) VALUES (?, ?, ?, ?)`,
            [session_id, a.event, JSON.stringify(a.details), a.ts]
          );
          console.log(`✅ Activity inserted (${a.event})`, result);
        } catch (err) {
          console.error(`❌ Failed inserting activity (${a.event}):`, err.message);
        }
      }
    } else {
      console.warn("⚠️ No activities received.");
    }

    res.status(200).json({ message: "Analytics data received successfully" });
  } catch (err) {
    console.error("🔥 Error saving analytics:", err);
    res.status(500).json({ error: "Failed to save analytics" });
  }
});

// ---------------- START SERVER ---------------- //
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
