// server/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// 🔒 Razorpay import (uncomment when using)
//// const createRazorpayOrder = require("./razorpay");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 📦 Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage: storage });

// 🔒 Razorpay order creation route (uncomment to enable)
/*
app.post("/api/create-order", async (req, res) => {
  const { name, amount, message } = req.body;

  if (!name || !amount || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const order = await createRazorpayOrder(amount);
    res.json({ order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order." });
  }
});
*/

// ✅ WebSocket Setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("✅ Overlay connected via WebSocket");
});

// 📩 Broadcast donation
app.post("/api/broadcast", upload.single("media"), (req, res) => {
  const { name, amount, message } = req.body;

  if (!name || !amount || !message) {
    return res.status(400).json({ error: "Invalid broadcast" });
  }

  const media = req.file
    ? {
      url: "/uploads/" + req.file.filename,
      type: req.file.mimetype,
    }
    : null;

  const payload = { name, amount, message, media };
  broadcastMessage(payload);
  res.status(200).json({ success: true });
});

app.get("/ping", (_, res) => res.send("🟢 UPChat is live"));

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
