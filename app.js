// app.js — MySQL-backed API matching schema.sql
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();
app.use(express.json());

// Serve /public so it can host /collector.js (optional if Apache serves it)
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;

// MySQL connection pool (matches schema.sql)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "analytics_user",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "analytics",
  waitForConnections: true,
  connectionLimit: 10,
});

// Parse JSON payload columns returned as strings
const parsePayload = (rows) =>
  rows.map((r) => (r.payload ? { ...r, payload: JSON.parse(r.payload) } : r));

/*
  Batch collector endpoint.
  collector.js POSTs: { sessionId, static, performance, activity[], sentAt }
  Fanout targets:
    - sessions (ensure a row exists for the session)
    - static_logs (optional)
    - performance_logs (optional)
    - activity_logs (0..N rows)
*/
app.post("/json/analytics", async (req, res) => {
  try {
    const { sessionId, static: s, performance: p, activity: acts } = req.body || {};
    if (!sessionId) return res.status(400).json({ ok: false, error: "missing sessionId" });

    // Insert session row if new (ignore duplicate errors)
    await pool
      .execute("INSERT INTO sessions (session_id) VALUES (?)", [sessionId])
      .catch(() => {});

    // Insert static payload if present
    if (s && Object.keys(s).length) {
      await pool.execute(
        "INSERT INTO static_logs (session_id, payload) VALUES (?, ?)",
        [sessionId, JSON.stringify(s)]
      );
    }

    // Insert performance payload if present
    if (p && Object.keys(p).length) {
      const pagePath = p?.page?.path || null;
      await pool.execute(
        "INSERT INTO performance_logs (session_id, page_path, payload) VALUES (?,?,?)",
        [sessionId, pagePath, JSON.stringify(p)]
      );
    }

    // Insert each activity event (transaction for atomicity)
    if (Array.isArray(acts) && acts.length) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const sql =
          "INSERT INTO activity_logs (session_id, type, ts, payload) VALUES (?,?,?,?)";
        for (const a of acts) {
          await conn.execute(sql, [
            sessionId,
            a.type || null,
            a.timestamp || null,
            JSON.stringify(a),
          ]);
        }
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    }

    res.status(202).json({ ok: true });
  } catch (e) {
    console.error("/json/analytics error:", e);
    res.status(500).json({ ok: false, error: "server error" });
  }
});

/* Static logs (backed by static_logs) */

// GET /api/static
app.get("/api/static", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, session_id, payload, created_at FROM static_logs ORDER BY id DESC LIMIT 500"
    );
    res.json(parsePayload(rows));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// GET /api/static/:id
app.get("/api/static/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, session_id, payload, created_at FROM static_logs WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Not Found");
    res.json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// POST /api/static  (manual insert for testing)
app.post("/api/static", async (req, res) => {
  try {
    const sessionId = req.body.sessionId || "manual";
    await pool.execute("INSERT INTO sessions (session_id) VALUES (?)", [sessionId]).catch(() => {});
    const [r] = await pool.execute(
      "INSERT INTO static_logs (session_id, payload) VALUES (?, ?)",
      [sessionId, JSON.stringify(req.body)]
    );
    const [rows] = await pool.query(
      "SELECT id, session_id, payload, created_at FROM static_logs WHERE id = ?",
      [r.insertId]
    );
    res.status(201).json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// PUT /api/static/:id  (overwrite JSON payload)
app.put("/api/static/:id", async (req, res) => {
  try {
    const [r] = await pool.execute(
      "UPDATE static_logs SET payload = ? WHERE id = ?",
      [JSON.stringify(req.body), req.params.id]
    );
    if (!r.affectedRows) return res.status(404).send("Not Found");
    const [rows] = await pool.query(
      "SELECT id, session_id, payload, created_at FROM static_logs WHERE id = ?",
      [req.params.id]
    );
    res.json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/static/:id
app.delete("/api/static/:id", async (req, res) => {
  try {
    const [r] = await pool.execute("DELETE FROM static_logs WHERE id = ?", [req.params.id]);
    if (!r.affectedRows) return res.status(404).send("Not Found");
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

/* Performance logs (backed by performance_logs) */

app.get("/api/performance", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, session_id, page_path, payload, created_at FROM performance_logs ORDER BY id DESC LIMIT 500"
    );
    res.json(parsePayload(rows));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/performance/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, session_id, page_path, payload, created_at FROM performance_logs WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Not Found");
    res.json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/performance", async (req, res) => {
  try {
    const sessionId = req.body.sessionId || "manual";
    await pool.execute("INSERT INTO sessions (session_id) VALUES (?)", [sessionId]).catch(() => {});
    const pagePath = req.body.page_path || req.body?.page?.path || null;
    const [r] = await pool.execute(
      "INSERT INTO performance_logs (session_id, page_path, payload) VALUES (?,?,?)",
      [sessionId, pagePath, JSON.stringify(req.body)]
    );
    const [rows] = await pool.query(
      "SELECT id, session_id, page_path, payload, created_at FROM performance_logs WHERE id = ?",
      [r.insertId]
    );
    res.status(201).json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.put("/api/performance/:id", async (req, res) => {
  try {
    const pagePath = req.body.page_path || req.body?.page?.path || null;
    const [r] = await pool.execute(
      "UPDATE performance_logs SET payload = ?, page_path = ? WHERE id = ?",
      [JSON.stringify(req.body), pagePath, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).send("Not Found");
    const [rows] = await pool.query(
      "SELECT id, session_id, page_path, payload, created_at FROM performance_logs WHERE id = ?",
      [req.params.id]
    );
    res.json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/api/performance/:id", async (req, res) => {
  try {
    const [r] = await pool.execute("DELETE FROM performance_logs WHERE id = ?", [req.params.id]);
    if (!r.affectedRows) return res.status(404).send("Not Found");
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

/* Activity logs (backed by activity_logs) */

app.get("/api/activity", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, session_id, type, ts, payload, created_at FROM activity_logs ORDER BY id DESC LIMIT 1000"
    );
    res.json(parsePayload(rows));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/activity/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, session_id, type, ts, payload, created_at FROM activity_logs WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Not Found");
    res.json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/activity", async (req, res) => {
  try {
    const sessionId = req.body.sessionId || "manual";
    await pool.execute("INSERT INTO sessions (session_id) VALUES (?)", [sessionId]).catch(() => {});
    const [r] = await pool.execute(
      "INSERT INTO activity_logs (session_id, type, ts, payload) VALUES (?,?,?,?)",
      [sessionId, req.body.type || null, req.body.ts || Date.now(), JSON.stringify(req.body)]
    );
    const [rows] = await pool.query(
      "SELECT id, session_id, type, ts, payload, created_at FROM activity_logs WHERE id = ?",
      [r.insertId]
    );
    res.status(201).json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.put("/api/activity/:id", async (req, res) => {
  try {
    const [r] = await pool.execute(
      "UPDATE activity_logs SET payload = ?, type = ?, ts = ? WHERE id = ?",
      [JSON.stringify(req.body), req.body.type || null, req.body.ts || Date.now(), req.params.id]
    );
    if (!r.affectedRows) return res.status(404).send("Not Found");
    const [rows] = await pool.query(
      "SELECT id, session_id, type, ts, payload, created_at FROM activity_logs WHERE id = ?",
      [req.params.id]
    );
    res.json(parsePayload(rows)[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/api/activity/:id", async (req, res) => {
  try {
    const [r] = await pool.execute("DELETE FROM activity_logs WHERE id = ?", [req.params.id]);
    if (!r.affectedRows) return res.status(404).send("Not Found");
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Quick debug bundle for sanity checks
app.get("/api/debug/all", async (_req, res) => {
  try {
    const [s] = await pool.query("SELECT * FROM static_logs ORDER BY id DESC LIMIT 25");
    const [p] = await pool.query("SELECT * FROM performance_logs ORDER BY id DESC LIMIT 25");
    const [a] = await pool.query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 25");
    res.json({
      static: parsePayload(s),
      performance: parsePayload(p),
      activity: parsePayload(a),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
