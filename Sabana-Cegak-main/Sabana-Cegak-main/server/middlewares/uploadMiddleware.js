import multer from "multer";

// Gunakan memoryStorage agar buffer file dapat langsung dikonversi ke format base64 untuk Gemini Vision API
const storage = multer.memoryStorage();

// Filter tipe file yang diperbolehkan: Dokumen PDF dan File Gambar (JPG, JPEG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Format file "${file.mimetype}" tidak didukung. Harap unggah dokumen medis berformat PDF atau Gambar (JPG, PNG, WEBP).`
      ),
      false
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Maksimal 15 MB
  },
});

