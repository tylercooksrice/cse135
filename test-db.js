// test-db.js
const mysql = require("mysql2/promise");

async function testDB() {
  try {
    // Create a connection pool (same credentials as app.js)
    const db = mysql.createPool({
      host: "localhost",
      user: "analytics_user",
      password: "CSE135powell$",
      database: "analytics"
    });

    console.log("✅ Connected to MySQL!");

    // Insert test row into static_data
    const [result] = await db.query(
      `INSERT INTO static_data 
       (session_id, userAgent, language, cookieEnabled, javaScriptEnabled, imagesEnabled, cssEnabled, 
        screenWidth, screenHeight, colorDepth, windowWidth, windowHeight, connectionType, onlineStatus, 
        pageUrl, pagePath, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "test_session_123",
        "NodeTestUA/1.0",
        "en-US",
        true,
        true,
        true,
        true,
        1920,
        1080,
        24,
        1200,
        800,
        "wifi",
        true,
        "http://example.com",
        "/test",
        "http://referrer.com"
      ]
    );

    console.log("✅ Inserted test row into static_data, ID:", result.insertId);

    // Fetch back the row
    const [rows] = await db.query(
      "SELECT * FROM static_data WHERE session_id = ?",
      ["test_session_123"]
    );

    console.log("📊 Retrieved rows:", rows);

    await db.end();
  } catch (err) {
    console.error("❌ Database test failed:", err);
  }
}

testDB();
