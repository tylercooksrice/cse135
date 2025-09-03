// app.js - REST API + analytics collector
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 4000; // pm2 handles proxy, Apache forwards /api -> 4000

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== MySQL Connection Pool =====
const db = mysql.createPool({
  host: "localhost",
  user: "analytics_user",   // change if needed
  password: "CSE135powell$", // change if needed
  database: "analytics", // your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ======== DEMO DATA (for REST.png screenshot) ========
const demoStatic = [
  { id: 1, userAgent: "Mozilla/5.0", language: "en-US" },
  { id: 2, userAgent: "Chrome/139.0", language: "en-US" },
];

// ======== REST ROUTES EXAMPLE ========

// GET all rows from a table
app.get("/api/:table", async (req, res) => {
  const { table } = req.params;

  try {
    if (table === "static" && process.env.DEMO === "true") {
      return res.json(demoStatic);
    }

    const [rows] = await db.query(`SELECT * FROM ??`, [table]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB query failed" });
  }
});

// GET single row by id
app.get("/api/:table/:id", async (req, res) => {
  const { table, id } = req.params;

  try {
    const [rows] = await db.query(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB query failed" });
  }
});

// POST new row
app.post("/api/:table", async (req, res) => {
  const { table } = req.params;
  const data = req.body;

  try {
    const [result] = await db.query(`INSERT INTO ?? SET ?`, [table, data]);
    res.status(201).json({ id: result.insertId, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// PUT update row
app.put("/api/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  try {
    await db.query(`UPDATE ?? SET ? WHERE id = ?`, [table, data, id]);
    res.json({ id, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB update failed" });
  }
});

// DELETE row
app.delete("/api/:table/:id", async (req, res) => {
  const { table, id } = req.params;

  try {
    await db.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB delete failed" });
  }
});

// ======== ANALYTICS ENDPOINT (from collector.js) ========
app.post("/json/analytics", (req, res) => {
  console.log("Analytics batch received:", req.body);

  // TODO: insert into DB (static, performance, activity tables)
  // e.g. db.query("INSERT INTO static SET ?", req.body.static)

  res.status(200).json({ message: "Analytics received" });
});

// ======== START SERVER ========
app.listen(PORT, () => {
  console.log(`REST API server running on port ${PORT}`);
});
