import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import apiRoutes from "./routes/apiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute Utama: Status API SABANA CEGAK
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SABANA CEGAK REST API Server aktif",
    version: "2.0.0",
    health: "/api/health",
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file maksimal 15 MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server.",
  });
});

// Jalankan Server dengan penanganan auto-fallback jika port sedang terpakai
const server = app.listen(PORT, () => {
  console.log("========================================");
  console.log(" 🏥 SABANA CEGAK - Home Care Companion");
  console.log(` 🚀 Server aktif: http://localhost:${PORT}`);
  console.log("========================================");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    const fallbackPort = Number(PORT) + 1;
    console.warn(`⚠️ Port ${PORT} sedang terpakai oleh proses sebelumnya. Mengalihkan ke port ${fallbackPort}...`);
    app.listen(fallbackPort, () => {
      console.log("========================================");
      console.log(` 🚀 Server aktif di: http://localhost:${fallbackPort}`);
      console.log("========================================");
    });
  } else {
    console.error("Server error:", err);
  }
});