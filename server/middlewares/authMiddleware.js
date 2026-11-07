import { verifyToken } from "../utils/authSecurity.js";

/**
 * Middleware untuk memproteksi endpoint privat dengan JWT
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Sesi login Anda telah kedaluwarsa atau token tidak valid. Silakan login kembali.",
    });
  }

  req.user = decoded; // { id, email, name, role }
  next();
};
