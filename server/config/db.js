import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Pastikan direktori data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let prismaClient = null;
try {
  prismaClient = new PrismaClient();
  prismaClient.$connect()
    .then(() => console.log("🗄️  Prisma berhasil terhubung ke MySQL: sabana_cegak"))
    .catch((err) => console.warn("⚠️  Prisma MySQL belum aktif, menggunakan fallback lokal:", err.message));
} catch (err) {
  console.warn("⚠️  Prisma Client gagal diinisialisasi:", err.message);
}

export const prisma = prismaClient;

// Default initial state bila database belum ada
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

// Muat data dari file disk bila ada, atau buat baru
let loadedData = null;
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    loadedData = JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca database disk, menggunakan inisialisasi baru:", err);
  }
}

export const memoryStore = loadedData || initialDb;

// Fungsi simpan otomatis ke file disk
export const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan database ke disk:", err);
  }
};

// Simpan awal jika file belum ada
if (!fs.existsSync(DB_FILE)) {
  saveDb();
}
