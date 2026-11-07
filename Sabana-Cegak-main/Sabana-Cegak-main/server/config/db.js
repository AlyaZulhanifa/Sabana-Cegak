import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const ENV_FILE = path.join(__dirname, "..", ".env");

dotenv.config({ path: ENV_FILE });

// Pastikan direktori data fallback ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================================================
// 1. KONEKSI POOL MYSQL (phpMyAdmin: sabana_cegak)
// ============================================================================
export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "sabana_cegak",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const dbPool = mysql.createPool(dbConfig);

/**
 * Fungsi Pengujian Koneksi Database MySQL & Pembacaan Tabel
 */
export async function testDbConnection() {
  try {
    const connection = await dbPool.getConnection();
    console.log("=================================================================");
    console.log("✅ [MySQL phpMyAdmin] Koneksi ke database 'sabana_cegak' BERHASIL!");
    console.log(`📡 Host: ${dbConfig.host}:${dbConfig.port} | User: ${dbConfig.user} | DB: ${dbConfig.database}`);

    // Uji eksekusi query sederhana untuk membaca daftar tabel
    const [tables] = await connection.query("SHOW TABLES;");
    const tableNames = tables.map((row) => Object.values(row)[0]);
    console.log(`📋 Tabel terdeteksi (${tableNames.length} tabel):`, tableNames.length > 0 ? tableNames.join(", ") : "(Database belum memiliki tabel)");
    console.log("=================================================================");

    connection.release();
    return {
      success: true,
      message: "Koneksi database MySQL sabana_cegak berhasil.",
      tables: tableNames,
    };
  } catch (error) {
    console.error("=================================================================");
    console.error("❌ [MySQL phpMyAdmin] Gagal menghubungkan ke database MySQL 'sabana_cegak':");
    console.error(`⚠️ Pesan Error: ${error.message}`);
    console.error("💡 Solusi Troubleshooting:");
    console.error("   1. Pastikan modul MySQL pada XAMPP / WAMP / phpMyAdmin sedang berjalan (Running).");
    console.error("   2. Pastikan database bernama 'sabana_cegak' sudah dibuat di http://localhost/phpmyadmin");
    console.error("   3. Periksa port default (3306) dan username/password pada file .env");
    console.error("=================================================================");
    return {
      success: false,
      message: error.message,
      troubleshoot: "Pastikan MySQL XAMPP aktif dan database 'sabana_cegak' sudah dibuat di phpMyAdmin.",
    };
  }
}

/**
 * Helper modul query untuk mengeksekusi SQL secara aman
 */
export async function query(sql, params = []) {
  try {
    const [results] = await dbPool.query(sql, params);
    return results;
  } catch (err) {
    console.error(`❌ [DB Query Error] SQL: ${sql} | Error: ${err.message}`);
    throw err;
  }
}

// Pengujian koneksi saat server index.js aktif
let isInitialTested = false;
export async function initDb() {
  if (!isInitialTested) {
    isInitialTested = true;
    return await testDbConnection();
  }
}

// ============================================================================
// 2. PRISMA CLIENT INITIALIZATION (Kompatibilitas ORM Skema)
// ============================================================================
let prismaClient = null;
try {
  prismaClient = new PrismaClient();
  prismaClient.$connect()
    .then(() => console.log("🗄️  Prisma ORM siap terhubung ke MySQL: sabana_cegak"))
    .catch((err) => console.warn("ℹ️  Prisma ORM standby / fallback aktif:", err.message));
} catch (err) {
  console.warn("ℹ️  Prisma Client standby:", err.message);
}

export const prisma = prismaClient;

// ============================================================================
// 3. IN-MEMORY & JSON FILE FALLBACK (Menjamin aplikasi tidak pernah crash)
// ============================================================================
const initialDb = {
  users: [],
  patients: [],
  diagnoses: [],
  medications: [],
  medicationLogs: [],
  careInstructions: [],
  careChecklists: [],
  careChecklistLogs: [],
  careAlerts: [],
  careNotes: [],
  documents: [],
  analyses: [],
};

let loadedData = null;
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    loadedData = JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca database disk lokal:", err);
  }
}

export const memoryStore = loadedData || initialDb;

export const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan database ke disk lokal:", err);
  }
};

if (!fs.existsSync(DB_FILE)) {
  saveDb();
}
