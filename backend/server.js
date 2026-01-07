import express from "express";
import sqlite3 from "sqlite3";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Database setup ===
const db = new sqlite3.Database("lost_found.db");

// === Create all tables ===
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS found_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemName TEXT,
    locationFound TEXT,
    dateFound TEXT,
    uploaderName TEXT,
    description TEXT,
    contact TEXT,
    photoPath TEXT,
    approved BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS lost_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemName TEXT,
    locationLost TEXT,
    dateLost TEXT,
    ownerName TEXT,
    description TEXT,
    contact TEXT,
    photoPath TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemId INTEGER,
  name TEXT,
  contact TEXT,
  proof TEXT,
  status TEXT DEFAULT 'Pending',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

});

// === File Upload Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===========================
//        FOUND ITEMS
// ===========================
app.post("/api/found", upload.single("photo"), (req, res) => {
  const { itemName, locationFound, dateFound, uploaderName, description, contact } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO found_items (itemName, locationFound, dateFound, uploaderName, description, contact, photoPath, approved)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [itemName, locationFound, dateFound, uploaderName, description, contact, photoPath],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/api/found", (req, res) => {
  db.all("SELECT * FROM found_items ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/found/approved", (req, res) => {
  db.all("SELECT * FROM found_items WHERE approved = 1 ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/reports", (req, res) => {
  db.all("SELECT * FROM found_items WHERE approved = 1 ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch("/api/found/:id/approve", (req, res) => {
  const { id } = req.params;
  db.run("UPDATE found_items SET approved = 1 WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id });
  });
});

app.delete("/api/found/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM found_items WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id });
  });
});

// ===========================
//        LOST ITEMS
// ===========================
// Save Lost Item
app.post("/api/lost", upload.single("photo"), (req, res) => {
  console.log("Lost report received:", req.body);
  console.log("File uploaded:", req.file);

  const { itemName, locationLost, dateLost, ownerName, description, contact } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO lost_items (itemName, locationLost, dateLost, ownerName, description, contact, photoPath)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [itemName, locationLost, dateLost, ownerName, description, contact, photoPath],
    function (err) {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});


// ✅ Fetch all lost reports
app.get("/api/lost", (req, res) => {
  db.all("SELECT * FROM lost_items ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===========================
//          CLAIMS
// ===========================
app.post("/api/claims", upload.none(), (req, res) => {
  console.log("Claim received:", req.body);
  const { name, contact, proof } = req.body;
  const { itemId } = req.query || req.body; // optional if sent with item

  if (!name || !contact || !proof) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  db.run(
    `INSERT INTO claims (itemId, name, contact, proof, status)
     VALUES (?, ?, ?, ?, 'Pending')`,
    [itemId || null, name, contact, proof],
    function (err) {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});


// ✅ Fetch all claims
app.get("/api/claims", (req, res) => {
  db.all("SELECT * FROM claims ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// ✅ UPDATE found item
app.put("/api/found/:id", (req, res) => {
  const { id } = req.params;
  const { itemName, locationFound, dateFound, uploaderName, description, contact } = req.body;

  db.run(
    `UPDATE found_items 
     SET itemName = ?, locationFound = ?, dateFound = ?, uploaderName = ?, description = ?, contact = ? 
     WHERE id = ?`,
    [itemName, locationFound, dateFound, uploaderName, description, contact, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// ✅ DELETE found item
app.delete("/api/found/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM found_items WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ✅ DELETE claim
app.delete("/api/claims/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM claims WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ===========================
//          SERVER
// ===========================
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
