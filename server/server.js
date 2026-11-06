const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();
app.locals.dbConnected = false;
// Restrict trust to a single proxy (dev proxy like CRA) to avoid permissive setting
app.set("trust proxy", 1);

function normalizeOrigin(value) {
  if (!value) return "";
  const trimmed = String(value).trim().replace(/\/+$/, "");
  try {
    return new URL(trimmed).origin;
  } catch (err) {
    return trimmed;
  }
}

// ── Connect MongoDB ───────────────────────────────────────────────────────────
const startServer = async () => {
  const conn = await connectDB();
  app.locals.dbConnected = Boolean(conn);

  if (conn) {
    try {
      const seedAdmin = require("./seeds/seedAdmin");
      await seedAdmin();
    } catch (e) {
      console.error("Failed to run seedAdmin:", e.message || e);
    }
  } else {
    console.warn("⚠️ Database unavailable; skipping seedAdmin and database seeding until MongoDB is reachable.");
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 ZENTRAX server → http://localhost:${PORT}`);
  });
};

// ── Middleware ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const envOrigins = rawClientUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const normalizedAllowedOrigins = new Set(
  [
    ...envOrigins,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

console.log("[CORS] CLIENT_URL raw =", rawClientUrl);
console.log("[CORS] Allowed origins =", Array.from(normalizedAllowedOrigins));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const normalizedRequestOrigin = normalizeOrigin(origin);

    try {
      const hostname = new URL(normalizedRequestOrigin).hostname;
      if (
        normalizedAllowedOrigins.has(normalizedRequestOrigin) ||
        hostname.endsWith(".vercel.app") ||
        normalizedRequestOrigin === `http://localhost:${PORT}`
      ) {
        return callback(null, true);
      }
    } catch (err) {
      return callback(new Error(`CORS policy: origin '${origin}' not allowed`));
    }

    callback(new Error(`CORS policy: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global request logger for debugging
app.use((req, res, next) => {
  try {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    console.log(`[REQ] headers: ${JSON.stringify(req.headers)}`);
  } catch (e) {}
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",    require("./routes/authRoutes"));
app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/api/admin/property-booking", require("./routes/propertyBookingAdminRoutes"));
app.use("/api/admin",   require("./routes/adminRoutes"));
app.use("/api/property-booking", require("./routes/propertyBookingPublicRoutes"));
app.use("/api/properties", require("./routes/propertiesRoutes"));
app.use("/api/manager", require("./routes/managerRoutes"));
app.use("/api/client",  require("./routes/clientRoutes"));
app.use("/api",         require("./routes/contactRoutes"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ZENTRAX RBAC Backend Running ✅",
    db: databaseConnected ? "MongoDB connected" : "MongoDB unavailable",
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER]', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.message && err.message.includes('Cloudinary')) {
    return res.status(500).json({ success: false, message: err.message });
  }

  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
} else {
  module.exports = app;
}
