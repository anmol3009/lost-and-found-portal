import express from "express";
import multer from "multer";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ===========================
//   FIREBASE ADMIN SETUP
//   (Firestore only — no Firebase Storage needed)
// ===========================
const require = createRequire(import.meta.url);
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ===========================
//   CLOUDINARY SETUP
// ===========================
cloudinary.config({
  cloud_name: "dc0gc2trv",
  api_key: "553745188816963",
  api_secret: "iGJaoFynxByqzX4IawlYGT4GYM4",
});

// ===========================
//   EXPRESS SETUP
// ===========================
const app = express();
const PORT = 5000;

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      "http://localhost:8080",
      "http://localhost:5173",
      "https://lost-and-found-portal-alpha.vercel.app"
    ];
    // Allow any Vercel preview deployments
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// Multer stores file in memory — no local disk writes
const upload = multer({ storage: multer.memoryStorage() });

// ===========================
//   HELPER: Upload photo to Cloudinary
// ===========================
async function uploadPhoto(file) {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "lost-found-portal",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // permanent https:// URL stored in Firestore
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

// ===========================
//   FOUND ITEMS
// ===========================

// POST — submit a found item (pending approval)
app.post("/api/found", upload.single("photo"), async (req, res) => {
  try {
    const { itemName, locationFound, dateFound, uploaderName, description, contact } = req.body;
    const photoURL = await uploadPhoto(req.file);

    const docRef = await db.collection("found_items").add({
      itemName,
      locationFound,
      dateFound,
      uploaderName,
      description,
      contact,
      photoURL,
      approved: false,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET — all found items (admin use)
app.get("/api/found", async (req, res) => {
  try {
    const snapshot = await db.collection("found_items").get();
    const rows = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — only approved found items (public gallery)
app.get("/api/found/approved", async (req, res) => {
  try {
    const snapshot = await db
      .collection("found_items")
      .where("approved", "==", true)
      .get();

    const rows = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Same as /api/found/approved — kept for backward compatibility
app.get("/api/reports", async (req, res) => {
  try {
    const snapshot = await db
      .collection("found_items")
      .where("approved", "==", true)
      .get();

    const rows = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH — approve a found item
app.patch("/api/found/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("found_items").doc(id).update({ approved: true });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — edit a found item
app.put("/api/found/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, locationFound, dateFound, uploaderName, description, contact } = req.body;

    await db.collection("found_items").doc(id).update({
      itemName,
      locationFound,
      dateFound,
      uploaderName,
      description,
      contact,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — delete a found item
app.delete("/api/found/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("found_items").doc(id).delete();
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
//   LOST ITEMS
// ===========================

// POST — submit a lost item report
app.post("/api/lost", upload.single("photo"), async (req, res) => {
  try {
    const { itemName, locationLost, dateLost, ownerName, description, contact } = req.body;
    const photoURL = await uploadPhoto(req.file);

    const docRef = await db.collection("lost_items").add({
      itemName,
      locationLost,
      dateLost,
      ownerName,
      description,
      contact,
      photoURL,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET — all lost items
app.get("/api/lost", async (req, res) => {
  try {
    const snapshot = await db.collection("lost_items").get();
    const rows = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
//   CLAIMS
// ===========================

// POST — submit a claim
app.post("/api/claims", upload.none(), async (req, res) => {
  try {
    const { name, contact, proof, itemId } = req.body;

    if (!name || !contact || !proof) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const docRef = await db.collection("claims").add({
      itemId: itemId || null,
      name,
      contact,
      proof,
      status: "Pending",
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET — all claims
app.get("/api/claims", async (req, res) => {
  try {
    const snapshot = await db.collection("claims").get();
    const rows = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — delete a claim
app.delete("/api/claims/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("claims").doc(id).delete();
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PATCH — approve a claim
app.patch("/api/claims/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("claims").doc(id).update({ status: "Approved" });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — delete a lost item
app.delete("/api/lost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("lost_items").doc(id).delete();
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
//   SERVER
// ===========================
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));