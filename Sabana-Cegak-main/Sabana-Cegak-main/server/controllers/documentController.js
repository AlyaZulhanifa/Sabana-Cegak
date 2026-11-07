import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runGeminiWithFallback } from "../config/gemini.js";
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
 * Controller: Upload dokumen medis dan jalankan ekstraksi Gemini AI multimodal
 * Hasil langsung disimpan ke database (Document, Medication, CareChecklist, CareAlert, CareNote)
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

    // 2. Hubungkan ke Pasien Aktif (Ibu Jusmanidar sebagai target utama)
    let targetPatient = null;
    if (req.body.patientId) {
      targetPatient = memoryStore.patients.find((p) => p.id === req.body.patientId);
    }
    if (!targetPatient) {
      targetPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
    }

    // Jika belum ada data pasien di memori, buat pasien Ibu Jusmanidar
    if (!targetPatient) {
      targetPatient = {
        id: "827c114e-60af-41dd-a618-6aed07229be4",
        name: "Ibu Jusmanidar",
        age: 65,
        gender: "Perempuan",
        dischargeDate: new Date().toISOString().split("T")[0],
        hospitalName: "RSUD Padang",
        primaryCaregiver: "Anggun Weldiana",
        relationship: "Anak Kandung",
        createdAt: new Date().toISOString(),
      };
      memoryStore.patients.push(targetPatient);
    }

    const patientId = targetPatient.id;
    const patientName = targetPatient.name;

    console.log(
      `[SABANA CEGAK] Memproses dokumen untuk pasien ${patientName} (${patientId}): ${req.file.originalname} (${req.file.mimetype})`
    );

    // 3. Simpan berkas fisik ke server/uploads/
    const documentId = `doc-${Date.now()}`;
    const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const diskFileName = `${documentId}-${sanitizedFileName}`;
    const filePath = path.join(UPLOADS_DIR, diskFileName);

    try {
      fs.writeFileSync(filePath, req.file.buffer);
    } catch (saveErr) {
      console.error("[Storage Error] Gagal menulis berkas ke disk:", saveErr);
    }

    // 4. Simpan record Dokumen Medis awal ke database
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

    // 5. Periksa Kunci Gemini API
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const isKeyConfigured = apiKey && apiKey.length > 10 && !apiKey.includes("kunci_gemini");

    let parsedJson = null;

    if (isKeyConfigured) {
      try {
        const docPart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);
        const result = await runGeminiWithFallback([
          MEDICAL_DOCUMENT_SYSTEM_PROMPT,
          docPart,
        ]);

        const responseText = (await result.response).text();
        const cleanJson = responseText
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
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
      return res.status(400).json({
        success: false,
        message:
          "Google Gemini API Key belum dikonfigurasi di server/.env. Masukkan GEMINI_API_KEY Anda untuk analisis otomatis.",
        documentId,
      });
    }

    // 6. SIMPAN HASIL EKSTRAKSI SECARA OTOMATIS KE DATABASE
    // a. Simpan Diagnosis Utama (bila ada)
    const rawDiag =
      typeof parsedJson.diagnosis_utama === "string"
        ? parsedJson.diagnosis_utama
        : parsedJson.diagnosis_utama?.value;
    if (rawDiag && rawDiag.trim()) {
      memoryStore.diagnoses.unshift({
        id: `diag-${Date.now()}`,
        patientId,
        name: rawDiag.trim(),
        source: "Resume Medis RS",
        confidence: "high",
        status: "VERIFIED",
        createdAt: new Date().toISOString(),
      });
    }

    // b. Simpan List Obat ke tabel/koleksi Medication
    const rawObat = parsedJson.daftar_obat || parsedJson.list_obat || [];
    const addedMedications = [];
    rawObat.forEach((obat, idx) => {
      if (!obat.nama_obat || !obat.nama_obat.trim()) return;

      let times = obat.waktu_minum;
      if (!times) {
        times = ["Pagi"];
      } else if (!Array.isArray(times)) {
        times = [String(times)];
      }

      // Ambil jumlah tablet fisik dari dokumen medis (kolom Jumlah / Quantity)
      const rawJumlah = obat.jumlah_tablet || obat.jumlah || obat.quantity || obat.qty;
      let totalTablets = 10;
      if (rawJumlah) {
        const parsed = parseInt(String(rawJumlah).replace(/[^0-9]/g, ""), 10);
        if (!isNaN(parsed) && parsed > 0) totalTablets = parsed;
      }
      const timesCount = times.length > 0 ? times.length : 1;
      const durationDays = Math.max(1, Math.ceil(totalTablets / timesCount));

      const medRecord = {
        id: `med-${Date.now()}-${idx}`,
        patientId,
        name: obat.nama_obat.trim(),
        dosage: obat.dosis || "Sesuai resep",
        frequency: obat.frekuensi || "Terjadwal",
        times: JSON.stringify(times),
        tabletsPerDose: 1,
        totalTablets,
        remainingTablets: totalTablets,
        startDate: new Date().toISOString().split("T")[0],
        durationDays,
        notes: obat.instruksi_khusus || obat.catatan || "",
        verificationStatus: "verified",
        sourceDocumentId: documentId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryStore.medications.push(medRecord);
      addedMedications.push(medRecord);
    });

    // c. Simpan Checklist Perawatan ke tabel/koleksi CareChecklist
    const rawChecklist =
      parsedJson.checklist_perawatan || parsedJson.instruksi_perawatan_rumah || [];
    const addedChecklists = [];
    rawChecklist.forEach((chk, idx) => {
      const taskText = chk.deskripsi_tugas || chk.tindakan || chk.title || "";
      if (!taskText.trim()) return;

      const chkRecord = {
        id: `chk-${Date.now()}-${idx}`,
        patientId,
        title: taskText.length > 60 ? taskText.substring(0, 57) + "..." : taskText,
        category: chk.kategori || "Aktivitas",
        description: taskText,
        frequency: "Setiap Hari",
        sourceDocumentId: documentId,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      memoryStore.careChecklists.push(chkRecord);
      addedChecklists.push(chkRecord);
    });

    // d. Simpan AI Care Alerts ke tabel/koleksi CareAlert
    const rawAlerts = parsedJson.ai_care_alerts || parsedJson.care_alerts || [];
    const addedAlerts = [];
    rawAlerts.forEach((alert, idx) => {
      const msg = alert.deskripsi_peringatan || alert.pesan || alert.message || "";
      if (!msg.trim()) return;

      const level = (alert.tipe || alert.level || "warning").toLowerCase();
      const alertRecord = {
        id: `alert-${Date.now()}-${idx}`,
        patientId,
        level: level === "danger" ? "danger" : "warning",
        category:
          alert.judul ||
          alert.kategori ||
          (level === "danger" ? "Tanda Bahaya Medis" : "Perhatian Caregiver"),
        message: msg,
        source: "Gemini AI Medical Safety Audit",
        sourceDocumentId: documentId,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      memoryStore.careAlerts.unshift(alertRecord);
      addedAlerts.push(alertRecord);
    });

    // e. Catat linimasa otomatis ke Riwayat Perawatan (CareNote)
    memoryStore.careNotes.unshift({
      id: `note-${Date.now()}`,
      patientId,
      authorName: "Gemini AI Medical Parser",
      category: "Ekstraksi Dokumen Medis",
      content: `Berkas medis "${req.file.originalname}" berhasil diekstrak dan tersimpan ke database ${patientName}. Sistem mendaftarkan ${addedMedications.length} obat aktif, ${addedChecklists.length} checklist panduan harian, dan ${addedAlerts.length} peringatan keselamatan AI.`,
      createdAt: new Date().toISOString(),
    });

    // f. Simpan rekam jejak DocumentAnalysis
    const analysisId = `analysis-${Date.now()}`;
    memoryStore.analyses.unshift({
      id: analysisId,
      documentId,
      patientId,
      rawJson: JSON.stringify(parsedJson),
      status: "VERIFIED",
      analyzedAt: new Date().toISOString(),
      data: parsedJson,
    });

    newDoc.status = "ANALYZED";
    saveDb();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return res.status(200).json({
      success: true,
      message: `Dokumen berhasil diekstrak dengan Gemini AI dan disimpan otomatis ke database untuk ${patientName}!`,
      patient: {
        id: patientId,
        name: patientName,
      },
      counts: {
        medications: addedMedications.length,
        checklists: addedChecklists.length,
        alerts: addedAlerts.length,
      },
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
    let targetPatient = null;
    if (req.body.patientId) {
      targetPatient = memoryStore.patients.find((p) => p.id === req.body.patientId);
    }
    if (!targetPatient) {
      targetPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
    }
    const patientId = targetPatient ? targetPatient.id : "827c114e-60af-41dd-a618-6aed07229be4";

    const { diagnosis = "Pasca Rawat Inap RS" } = req.body;
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
      diagnosis_utama: diagnosis || "",
      daftar_obat: [
        {
          nama_obat: "",
          dosis: "1 Tablet",
          frekuensi: "2 kali sehari",
          waktu_minum: ["Pagi", "Malam"],
          instruksi_khusus: "Minum sesudah makan",
        },
      ],
      checklist_perawatan: [
        {
          kategori: "Nutrisi",
          deskripsi_tugas: "Pola makan bergizi seimbang dan minum air putih cukup.",
        },
      ],
      ai_care_alerts: [],
      tanggal_kontrol: {
        tanggal: "",
        waktu: "09:00 WIB",
        poli: "",
        lokasi: "",
      },
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
 * Verifikasi & Penyesuaian Rencana Perawatan oleh Keluarga
 * POST /api/documents/verify
 */
export const verifyAndActivateCarePlan = async (req, res) => {
  try {
    const {
      patientId = "827c114e-60af-41dd-a618-6aed07229be4",
      analysisId,
      verifiedData,
      caregiverName = "Keluarga Pendamping",
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
      checklist_perawatan = [],
      instruksi_perawatan_rumah = [],
      tanggal_kontrol,
      ai_care_alerts = [],
    } = verifiedData;

    // 1. Simpan Diagnosis
    const diagText =
      typeof diagnosis_utama === "string" ? diagnosis_utama : diagnosis_utama?.value;
    if (diagText && diagText.trim()) {
      memoryStore.diagnoses.unshift({
        id: `diag-${Date.now()}`,
        patientId,
        name: diagText.trim(),
        source: "Verifikasi Manual Keluarga",
        confidence: "high",
        status: "VERIFIED",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Tambahkan / Update Obat
    const addedMedications = [];
    daftar_obat
      .filter((obat) => obat.nama_obat && obat.nama_obat.trim())
      .forEach((obat, idx) => {
        let times = obat.waktu_minum;
        if (!times) times = ["Pagi"];
        else if (!Array.isArray(times)) times = [String(times)];

        const rawJumlah = obat.jumlah_tablet || obat.jumlah || obat.quantity || obat.qty;
        let totalTablets = 10;
        if (rawJumlah) {
          const parsed = parseInt(String(rawJumlah).replace(/[^0-9]/g, ""), 10);
          if (!isNaN(parsed) && parsed > 0) totalTablets = parsed;
        }
        const timesCount = times.length > 0 ? times.length : 1;
        const durationDays = Math.max(1, Math.ceil(totalTablets / timesCount));

        const newMed = {
          id: `med-${Date.now()}-${idx}`,
          patientId,
          name: obat.nama_obat.trim(),
          dosage: obat.dosis || "Sesuai petunjuk",
          frequency: obat.frekuensi || "Terjadwal",
          times: JSON.stringify(times),
          tabletsPerDose: 1,
          totalTablets,
          remainingTablets: totalTablets,
          startDate: new Date().toISOString().split("T")[0],
          durationDays,
          notes: obat.instruksi_khusus || obat.catatan || "",
          verificationStatus: "verified",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existingMedIndex = memoryStore.medications.findIndex(
          (m) =>
            m.patientId === patientId &&
            m.isActive &&
            (m.name || "").trim().toLowerCase() === (obat.nama_obat || "").trim().toLowerCase()
        );

        if (existingMedIndex !== -1) {
          memoryStore.medications[existingMedIndex] = {
            ...memoryStore.medications[existingMedIndex],
            ...newMed,
            id: memoryStore.medications[existingMedIndex].id,
          };
          addedMedications.push(memoryStore.medications[existingMedIndex]);
        } else {
          memoryStore.medications.push(newMed);
          addedMedications.push(newMed);
        }
      });

    // 3. Tambahkan / Update Checklist
    const careList = checklist_perawatan.length > 0 ? checklist_perawatan : instruksi_perawatan_rumah;
    const addedChecklists = [];
    careList
      .filter((ins) => (ins.deskripsi_tugas || ins.tindakan) && (ins.deskripsi_tugas || ins.tindakan).trim())
      .forEach((instruksi, idx) => {
        const text = (instruksi.deskripsi_tugas || instruksi.tindakan).trim();
        const newChk = {
          id: `chk-${Date.now()}-${idx}`,
          patientId,
          title: text.length > 50 ? text.substring(0, 48) + "..." : text,
          category: instruksi.kategori || "Aktivitas",
          description: text,
          frequency: "Setiap Hari",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        memoryStore.careChecklists.push(newChk);
        addedChecklists.push(newChk);
      });

    // 4. Tambahkan Peringatan AI
    ai_care_alerts.forEach((alert, idx) => {
      const msg = alert.deskripsi_peringatan || alert.pesan || alert.message;
      if (!msg) return;
      const level = (alert.tipe || alert.level || "warning").toLowerCase();
      memoryStore.careAlerts.unshift({
        id: `alert-${Date.now()}-${idx}`,
        patientId,
        level: level === "danger" ? "danger" : "warning",
        category: alert.judul || alert.kategori || "Peringatan Medis",
        message: msg,
        source: "Verifikasi Manual",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      });
    });

    // 5. Catat log riwayat
    memoryStore.careNotes.unshift({
      id: `note-${Date.now()}`,
      patientId,
      authorName: caregiverName,
      category: "Verifikasi Rencana Perawatan",
      content: `Rencana perawatan mandiri berhasil diverifikasi oleh ${caregiverName}. Ditambahkan ${addedMedications.length} obat dan ${addedChecklists.length} aktivitas panduan harian.`,
      createdAt: new Date().toISOString(),
    });

    saveDb();

    return res.status(200).json({
      success: true,
      message: "Rencana perawatan berhasil diverifikasi dan diaktifkan ke Dasbor Pasien!",
      summary: {
        medicationsCount: addedMedications.length,
        checklistsCount: addedChecklists.length,
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
    let patientId = req.query.patientId;
    if (!patientId) {
      const defaultPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
      patientId = defaultPatient?.id;
    }

    const docs = memoryStore.documents.filter(
      (d) => !patientId || d.patientId === patientId
    );

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
