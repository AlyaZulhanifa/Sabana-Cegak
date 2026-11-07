
import { memoryStore, saveDb } from "../config/db.js";
import {
  hashPassword,
  comparePassword,
  signToken,
} from "../utils/authSecurity.js";

/**
 * Validasi format email
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Format data user untuk respons API.
 * Password tidak dikirim ke frontend.
 */
const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || null,
});

/**
 * Registrasi Akun Keluarga Baru
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // 1. Validasi input wajib
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap, email, dan kata sandi wajib diisi.",
      });
    }

    // 2. Validasi nama
    const normalizedName = name.trim();

    if (normalizedName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap minimal 3 karakter.",
      });
    }

    // 3. Normalisasi dan validasi email
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    // 4. Validasi konfirmasi password
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Konfirmasi kata sandi tidak cocok.",
      });
    }

    // 5. Validasi panjang password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Kata sandi minimal 8 karakter.",
      });
    }

    // 6. Pastikan memoryStore tersedia
    if (!Array.isArray(memoryStore.users)) {
      memoryStore.users = [];
    }

    // 7. Cek email yang sudah terdaftar
    const existingUser = memoryStore.users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar. Silakan login.",
      });
    }

    // 8. Hash password
    const hashedPassword = await hashPassword(password);

    // 9. Buat akun baru
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "FAMILY_CAREGIVER",
      phone: typeof phone === "string" ? phone.trim() || null : null,
      createdAt: new Date().toISOString(),
    };

    // 10. Simpan akun ke database persisten
    memoryStore.users.push(newUser);
    saveDb();

    // 11. Buat token autentikasi
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    // 12. Kirim respons
    return res.status(201).json({
      success: true,
      message: "Registrasi akun keluarga berhasil!",
      token,
      user: formatUser(newUser),
    });
  } catch (error) {
    console.error("[Auth Register Error]:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses registrasi.",
    });
  }
};

/**
 * Login Akun Keluarga
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email dan kata sandi wajib diisi.",
      });
    }

    // 2. Normalisasi email
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    // 3. Cari akun berdasarkan email
    const users = Array.isArray(memoryStore.users)
      ? memoryStore.users
      : [];

    const user = users.find(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau kata sandi tidak sesuai.",
      });
    }

    // 4. Verifikasi password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau kata sandi tidak sesuai.",
      });
    }

    // 5. Buat token autentikasi
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 6. Kirim respons
    return res.status(200).json({
      success: true,
      message: "Login berhasil! Selamat datang kembali di SABANA CEGAK.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("[Auth Login Error]:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses login.",
    });
  }
};

/**
 * Mendapatkan Profil Pengguna Saat Ini
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    // 1. Periksa autentikasi
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Pengguna belum terautentikasi.",
      });
    }

    // 2. Cari akun
    const users = Array.isArray(memoryStore.users)
      ? memoryStore.users
      : [];

    const user = users.find(
      (item) => item.id === req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Data pengguna tidak ditemukan.",
      });
    }

    // 3. Kirim profil pengguna
    return res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("[Auth Get Profile Error]:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memuat profil pengguna.",
    });
  }
};

/**
 * Memperbarui Profil Caregiver
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Pengguna belum terautentikasi.",
      });
    }

    const { name, phone } = req.body;
    const user = memoryStore.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Data pengguna tidak ditemukan.",
      });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;

    saveDb();

    return res.status(200).json({
      success: true,
      message: "Profil caregiver berhasil diperbarui.",
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil.",
    });
  }
};
