npm run dev:serverimport express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/apiRoutes.js";

// Setup path direktori
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

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

// Layani file statis dari folder public
app.use(express.static(publicPath));

// Rute Utama: Langsung Tampilkan Halaman Login SABANA CEGAK
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Rute alternatif /login
app.get("/login", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
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
