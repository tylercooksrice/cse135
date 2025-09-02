// app.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// App setup
const app = express();
app.use(bodyParser.json());

// Serve /public so it can host /collector.js (optional if Apache serves it)
app.use(express.static(path.join(__dirname, "public")));

// In memory "DB" (replace with real DB later)
let staticData = [
  { id: 1, userAgent: "Mozilla/5.0", language: "en-US" },
  { id: 2, userAgent: "Chrome/118.0", language: "en-US" }
];

let performanceData = [
  { id: 1, page: "home", loadTime: 250 },
  { id: 2, page: "about", loadTime: 340 }
];

let activityData = [
  { id: 1, event: "click", details: "button#login" },
  { id: 2, event: "scroll", details: "y=400" }
];

// Helpers
const nextId = (arr) => (arr.length ? Math.max(...arr.map(x => x.id || 0)) + 1 : 1);

// REST routes (Static)
app.get("/api/static", (req, res) => res.json(staticData));

app.get("/api/static/:id", (req, res) => {
  const item = staticData.find(d => d.id === parseInt(req.params.id));
  item ? res.json(item) : res.status(404).send("Not Found");
});

app.post("/api/static", (req, res) => {
  const newItem = { id: nextId(staticData), ...req.body };
  staticData.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/static/:id", (req, res) => {
  const index = staticData.findIndex(d => d.id === parseInt(req.params.id));
  if (index !== -1) {
    staticData[index] = { ...staticData[index], ...req.body };
    res.json(staticData[index]);
  } else {
    res.status(404).send("Not Found");
  }
});

app.delete("/api/static/:id", (req, res) => {
  staticData = staticData.filter(d => d.id !== parseInt(req.params.id));
  res.status(204).send();
});

// REST routes (Performance)
app.get("/api/performance", (req, res) => res.json(performanceData));

app.get("/api/performance/:id", (req, res) => {
  const item = performanceData.find(d => d.id === parseInt(req.params.id));
  item ? res.json(item) : res.status(404).send("Not Found");
});

app.post("/api/performance", (req, res) => {
  const newItem = { id: nextId(performanceData), ts: Date.now(), ...req.body };
  performanceData.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/performance/:id", (req, res) => {
  const idx = performanceData.findIndex(d => d.id === parseInt(req.params.id));
  if (idx !== -1) {
    performanceData[idx] = { ...performanceData[idx], ...req.body };
    res.json(performanceData[idx]);
  } else res.status(404).send("Not Found");
});

app.delete("/api/performance/:id", (req, res) => {
  performanceData = performanceData.filter(d => d.id !== parseInt(req.params.id));
  res.status(204).send();
});

// REST routes (Activity)
app.get("/api/activity", (req, res) => res.json(activityData));

app.get("/api/activity/:id", (req, res) => {
  const item = activityData.find(d => d.id === parseInt(req.params.id));
  item ? res.json(item) : res.status(404).send("Not Found");
});

app.post("/api/activity", (req, res) => {
  const newItem = { id: nextId(activityData), ts: Date.now(), ...req.body };
  activityData.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/activity/:id", (req, res) => {
  const idx = activityData.findIndex(d => d.id === parseInt(req.params.id));
  if (idx !== -1) {
    activityData[idx] = { ...activityData[idx], ...req.body };
    res.json(activityData[idx]);
  } else res.status(404).send("Not Found");
});

app.delete("/api/activity/:id", (req, res) => {
  activityData = activityData.filter(d => d.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.post("/json/analytics", (req, res) => {
  try {
    const { sessionId, static: staticBlock, performance: perfBlock, activity: activities } = req.body || {};

    // Upsert a static record for this session (simple approach: just append with sessionId)
    if (staticBlock && Object.keys(staticBlock).length) {
      staticData.push({
        id: nextId(staticData),
        sessionId,
        ...staticBlock
      });
    }

    // Store performance entry (one per batch if present)
    if (perfBlock && Object.keys(perfBlock).length) {
      performanceData.push({
        id: nextId(performanceData),
        sessionId,
        page: (perfBlock.page && perfBlock.page.path) || (typeof window !== "undefined" ? window.location?.pathname : undefined) || "unknown",
        ts: Date.now(),
        ...perfBlock
      });
    }

    // Store each activity item
    if (Array.isArray(activities)) {
      for (const a of activities) {
        activityData.push({
          id: nextId(activityData),
          sessionId,
          ts: a.timestamp || Date.now(),
          ...a
        });
      }
    }

    res.status(202).json({ ok: true });
  } catch (e) {
    console.error("Error handling /json/analytics:", e);
    res.status(400).json({ ok: false, error: "Bad payload" });
  }
});

// Convenience debug route
app.get("/api/debug/all", (req, res) => {
  res.json({ staticData, performanceData, activityData });
});

// Start server (proxy via Apache/Nginx to /api and /json)
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
