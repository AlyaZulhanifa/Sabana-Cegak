import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { geminiModel } from "../config/gemini.js";
import { MEDICAL_DOCUMENT_SYSTEM_PROMPT } from "../prompts/medicalPrompts.js";
import { memoryStore, saveDb } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Mengonversi buffer Multer ke format inlineData Gemini API
 */
const bufferToGenerativePart = (buffer, mimeType) => ({
  inlineData: {
    data: buffer.toString("base64"),
    mimeType,
  },
});

/**
 * Controller: Upload dokumen medis dan jalankan ekstraksi Gemini AI
 * POST /api/documents/upload
 */
export const uploadAndAnalyzeDocument = async (req, res) => {
  const startTime = Date.now();

  try {
    // 1. Validasi berkas upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada berkas dokumen medis yang diunggah. Pilih file PDF, JPG, JPEG, atau PNG.",
      });
    }

    const patientId = req.body.patientId || memoryStore.patients[0]?.id || "patient-1";

    console.log(
      `[SABANA CEGAK] Memproses dokumen pasien (${patientId}): ${req.file.originalname} (${req.file.mimetype})`
    );

    // 2. Simpan file fisik ke direktori server/uploads/
    const documentId = `doc-${Date.now()}`;
    const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const diskFileName = `${documentId}-${sanitizedFileName}`;
    const filePath = path.join(UPLOADS_DIR, diskFileName);

    try {
      fs.writeFileSync(filePath, req.file.buffer);
    } catch (saveErr) {
      console.error("[Storage Error] Gagal menulis berkas ke disk:", saveErr);
    }

    // 3. Simpan metadata record dokumen ke database
    const newDoc = {
      id: documentId,
      patientId,
      fileName: req.file.originalname,
      diskFileName,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: "ANALYZING",
      uploadedAt: new Date().toISOString(),
    };
    memoryStore.documents.unshift(newDoc);
    saveDb();

    // 4. Periksa ketersediaan Kunci Google Gemini API
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const isKeyConfigured = apiKey && apiKey.startsWith("AIzaSy") && !apiKey.includes("kunci_gemini");

    let parsedJson = null;

    if (isKeyConfigured) {
      try {
        const docPart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);
        const result = await geminiModel.generateContent([
          MEDICAL_DOCUMENT_SYSTEM_PROMPT,
          docPart,
        ]);

        const responseText = (await result.response).text();
        const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        parsedJson = JSON.parse(cleanJson);
      } catch (geminiError) {
        console.error("[Gemini API Error]:", geminiError.message);
        return res.status(502).json({
          success: false,
          message: `Ekstraksi AI gagal: ${geminiError.message}. Periksa kuota atau kunci GEMINI_API_KEY Anda di server/.env, atau gunakan input data manual.`,
          documentId,
        });
      }
    } else {
      // Jika API Key belum dikonfigurasi, beri tahu secara jujur
      return res.status(400).json({
        success: false,
        message: "Google Gemini API Key belum dikonfigurasi di server/.env. Masukkan GEMINI_API_KEY Anda dari Google AI Studio untuk analisis otomatis, atau masukkan rencana perawatan secara mandiri.",
        documentId,
      });
    }

    const analysisId = `analysis-${Date.now()}`;
    const analysisRecord = {
      id: analysisId,
      documentId,
      patientId,
      rawJson: JSON.stringify(parsedJson),
      status: "PENDING_VERIFICATION",
      analyzedAt: new Date().toISOString(),
      data: parsedJson,
    };
    memoryStore.analyses.unshift(analysisRecord);

    newDoc.status = "ANALYZED";
    saveDb();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return res.status(200).json({
      success: true,
      message: "Dokumen berhasil dibaca oleh Gemini AI. Silakan verifikasi hasil ekstraksi sebelum mengaktifkan rencana perawatan.",
      meta: {
        analysisId,
        documentId,
        filename: req.file.originalname,
        filesize: req.file.size,
        fileType: req.file.mimetype,
        durationSeconds: parseFloat(duration),
      },
      data: parsedJson,
    });
  } catch (error) {
    console.error("[Document Controller Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memproses dan menganalisis dokumen medis.",
      error: error.message,
    });
  }
};

/**
 * Memulai entri rencana perawatan mandiri (tanpa ekstraksi AI)
 * POST /api/documents/manual-entry
 */
export const startManualCarePlan = async (req, res) => {
  try {
    const { patientId = "patient-1", diagnosis = "" } = req.body;
    const documentId = `doc-manual-${Date.now()}`;

    const newDoc = {
      id: documentId,
      patientId,
      fileName: "Entri Rencana Perawatan Mandiri.pdf",
      fileType: "application/pdf",
      fileSize: 0,
      status: "MANUAL_ENTRY",
      uploadedAt: new Date().toISOString(),
    };
    memoryStore.documents.unshift(newDoc);

    const templateData = {
      diagnosis_utama: {
        value: diagnosis || "",
        source: "Input Manual Keluarga",
        confidence: "Tinggi",
      },
      daftar_obat: [
        {
          nama_obat: "",
          dosis: "",
          frekuensi: "3 kali sehari",
          waktu_minum: ["Pagi", "Siang", "Malam"],
          catatan: "Minum sesudah makan",
          verification_status: "pending",
        },
      ],
      instruksi_perawatan_rumah: [
        {
          kategori: "Nutrisi",
          tindakan: "Pola makan bergizi seimbang dan minum air putih cukup.",
          verification_status: "pending",
        },
      ],
      tanggal_kontrol: {
        tanggal: "",
        waktu: "09:00 WIB",
        poli: "",
        lokasi: "",
      },
      ai_care_alerts: [],
    };

    const analysisId = `analysis-${Date.now()}`;
    memoryStore.analyses.unshift({
      id: analysisId,
      documentId,
      patientId,
      rawJson: JSON.stringify(templateData),
      status: "PENDING_VERIFICATION",
      analyzedAt: new Date().toISOString(),
      data: templateData,
    });

    saveDb();

    return res.status(200).json({
      success: true,
      message: "Template rencana perawatan siap diisi.",
      meta: { analysisId, documentId },
      data: templateData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat formulir perawatan manual.",
    });
  }
};

/**
 * TAHAP 8 — VERIFIKASI KELUARGA & AKTIVASI RENCANA PERAWATAN
 * POST /api/documents/verify
 */
export const verifyAndActivateCarePlan = async (req, res) => {
  try {
    const {
      patientId = "patient-1",
      analysisId,
      verifiedData,
      caregiverName = "Siti Rahma",
    } = req.body;

    if (!verifiedData) {
      return res.status(400).json({
        success: false,
        message: "Data verifikasi tidak boleh kosong.",
      });
    }

    const {
      diagnosis_utama,
      daftar_obat = [],
      instruksi_perawatan_rumah = [],
      tanggal_kontrol,
      ai_care_alerts = [],
    } = verifiedData;

    // 1. Simpan atau perbarui Diagnosis terverifikasi
    if (diagnosis_utama?.value) {
      memoryStore.diagnoses.unshift({
        id: `diag-${Date.now()}`,
        patientId,
        name: diagnosis_utama.value,
        source: diagnosis_utama.source || "Ringkasan Medis",
        confidence: diagnosis_utama.confidence || "high",
        status: "VERIFIED",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Aktifkan Daftar Obat & Buat Jadwal Minum Obat
    const addedMedications = [];
    daftar_obat
      .filter((obat) => obat.nama_obat && obat.nama_obat.trim())
      .forEach((obat, idx) => {
        const medId = `med-${Date.now()}-${idx}`;
        const newMed = {
          id: medId,
          patientId,
          name: obat.nama_obat.trim(),
          dosage: obat.dosis || "Sesuai petunjuk",
          frequency: obat.frekuensi || "Terjadwal",
          times: JSON.stringify(Array.isArray(obat.waktu_minum) ? obat.waktu_minum : [obat.waktu_minum || "Pagi"]),
          notes: obat.catatan || "",
          verificationStatus: "verified",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        memoryStore.medications.push(newMed);
        addedMedications.push(newMed);
      });

    // 3. Aktifkan Checklist Aktivitas Harian Perawatan Rumah
    const addedChecklists = [];
    instruksi_perawatan_rumah
      .filter((ins) => ins.tindakan && ins.tindakan.trim())
      .forEach((instruksi, idx) => {
        const chkId = `chk-${Date.now()}-${idx}`;
        const newChk = {
          id: chkId,
          patientId,
          title: instruksi.tindakan.length > 50 ? instruksi.tindakan.substring(0, 48) + "..." : instruksi.tindakan,
          category: instruksi.kategori || "Lainnya",
          description: instruksi.tindakan,
          frequency: "Setiap Hari",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        memoryStore.careChecklists.push(newChk);
        addedChecklists.push(newChk);
      });

    // 5. Daftarkan Peringatan Keselamatan AI yang masih aktif
    ai_care_alerts.forEach((alert, idx) => {
      memoryStore.careAlerts.unshift({
        id: `alert-${Date.now()}-${idx}`,
        patientId,
        level: alert.level || "warning",
        category: alert.kategori || "Peringatan Medis",
        message: alert.pesan,
        source: "Verifikasi Dokumen Medis",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      });
    });

    // 6. Catat log riwayat verifikasi keluarga
    memoryStore.careNotes.unshift({
      id: `note-${Date.now()}`,
      patientId,
      authorName: caregiverName,
      category: "Verifikasi Rencana Perawatan",
      content: `Rencana perawatan mandiri di rumah telah diverifikasi dan diaktifkan oleh ${caregiverName}. Terverifikasi ${addedMedications.length} obat dan ${addedChecklists.length} checklist harian.`,
      createdAt: new Date().toISOString(),
    });

    saveDb();

    return res.status(200).json({
      success: true,
      message: "Rencana perawatan berhasil diverifikasi dan diaktifkan ke Dasbor Pasien!",
      summary: {
        medicationsCount: addedMedications.length,
        checklistsCount: addedChecklists.length,
        appointmentActive: !!(tanggal_kontrol && tanggal_kontrol.tanggal),
      },
    });
  } catch (error) {
    console.error("[Verify Care Plan Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengaktifkan rencana perawatan.",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan riwayat berkas dokumen pasien
 * GET /api/documents?patientId=...
 */
export const getDocuments = async (req, res) => {
  try {
    const patientId = req.query.patientId || memoryStore.patients[0]?.id || "patient-1";
    const docs = memoryStore.documents.filter((d) => d.patientId === patientId);

    return res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat dokumen medis.",
    });
  }
};

/**
 * Mengunduh / melihat berkas dokumen fisik
 * GET /api/documents/file/:id
 */
export const getDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = memoryStore.documents.find((d) => d.id === id);

    if (!doc || !doc.diskFileName) {
      return res.status(404).json({
        success: false,
        message: "Berkas dokumen tidak ditemukan di server.",
      });
    }

    const filePath = path.join(UPLOADS_DIR, doc.diskFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File fisik tidak ditemukan pada penyimpanan.",
      });
    }

    res.setHeader("Content-Type", doc.fileType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengunduh berkas.",
    });
  }
};
