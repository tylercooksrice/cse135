const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// --- Dummy data for now (replace with DB later) ---
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

// --- Routes follow REST pattern ---

// Static Data
app.get("/api/static", (req, res) => res.json(staticData));
app.get("/api/static/:id", (req, res) => {
  const item = staticData.find(d => d.id === parseInt(req.params.id));
  item ? res.json(item) : res.status(404).send("Not Found");
});
app.post("/api/static", (req, res) => {
  const newItem = { id: staticData.length + 1, ...req.body };
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

// Performance Data
app.get("/api/performance", (req, res) => res.json(performanceData));

// Activity Data
app.get("/api/activity", (req, res) => res.json(activityData));

// Start server
// you can proxy this later through Apache as /api
const PORT = 4000; 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
