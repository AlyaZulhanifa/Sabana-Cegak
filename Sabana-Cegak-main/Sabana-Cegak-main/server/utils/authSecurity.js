import crypto from "crypto";

const JWT_SECRET = (process.env.JWT_SECRET || "sabana_cegak_secure_jwt_secret_firetech_2026").trim();

/**
 * Hash password menggunakan algoritma standar industri PBKDF2 (NIST compliant, built-in Node.js crypto)
 * Bebas dependensi eksternal, 100% selalu berjalan di semua versi Node.js
 */
export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

/**
 * Bandingkan dan verifikasi password
 */
export const comparePassword = async (password, storedPassword) => {
  if (!password || !storedPassword) return false;

  // Verifikasi hash dengan salt (PBKDF2)
  if (storedPassword.includes(":")) {
    const [salt, originalHash] = storedPassword.split(":");
    const testHash = crypto.pbkdf2Sync(String(password), salt, 1000, 64, "sha512").toString("hex");
    return testHash === originalHash;
  }

  return String(password) === String(storedPassword);
};

/**
 * Buat JWT / Token Bertanda Tangan (HMAC SHA-256 standar, built-in Node.js crypto)
 */
export const signToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 7 * 24 * 3600 * 1000, // Berlaku 7 hari
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
};

/**
 * Verifikasi token JWT
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && payload.exp < Date.now()) return null;

    return payload;
  } catch (err) {
    return null;
  }
};
