const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./database");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.disable("x-powered-by");

// Add production and preview frontend URLs as a comma-separated environment value.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(
  cors({
    origin(origin, callback) {
      // Health checks and server-to-server clients may not send an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const error = new Error("This frontend URL is not allowed");
      error.status = 403;
      callback(error);
    },
  }),
);
app.use(express.json({ limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({ message: "TaskMate API", health: "/api/health" });
});

// Await MongoDB before handling API requests. Warm Vercel invocations reuse it.
app.use("/api", async (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!process.env.JWT_SECRET) {
    return res
      .status(503)
      .json({ message: "Server authentication is not configured" });
  }
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.name);
    res
      .status(503)
      .json({ message: "Database is unavailable. Please try again." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api", todoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  const message =
    status === 500 ? "Server error. Please try again." : error.message;
  res.status(status).json({ message });
});

// Vercel runs the exported app. A local terminal starts the regular HTTP server.
if (require.main === module && !process.env.VERCEL) {
  const port = process.env.PORT || 5001;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
