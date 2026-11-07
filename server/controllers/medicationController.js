import { memoryStore, saveDb } from "../config/db.js";

/**
 * Mendapatkan daftar obat aktif untuk pasien
 * GET /api/medications?patientId=...
 */
export const getMedications = async (req, res) => {
  try {
    const patientId = req.query.patientId || memoryStore.patients[0]?.id;
    const medications = memoryStore.medications.filter(
      (m) => m.patientId === patientId && m.isActive
    );

    return res.status(200).json({
      success: true,
      data: medications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat daftar obat.",
    });
  }
};

/**
 * Menambahkan obat baru secara manual
 * POST /api/medications
 */
export const createMedication = async (req, res) => {
  try {
    const {
      patientId,
      name,
      dosage,
      frequency,
      times,
      notes,
    } = req.body;

    if (!name || !dosage) {
      return res.status(400).json({
        success: false,
        message: "Nama obat dan dosis wajib diisi.",
      });
    }

    const newMed = {
      id: `med-${Date.now()}`,
      patientId,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency || "Sesuai resep",
      times: JSON.stringify(Array.isArray(times) ? times : [times || "Pagi"]),
      notes: notes || "",
      verificationStatus: "verified",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.medications.push(newMed);
    saveDb();

    return res.status(201).json({
      success: true,
      message: `Obat "${newMed.name}" berhasil ditambahkan ke jadwal.`,
      data: newMed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan obat.",
    });
  }
};

/**
 * Mencatat pemberian obat oleh keluarga
 * POST /api/medications/:id/log
 * Status: GIVEN (Sudah Diminum) / SKIPPED (Terlewat) / CANCELLED (Dibatalkan)
 */
export const logMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status = "GIVEN",
      scheduledTime,
      reason,
      recordedByName = "Siti Rahma",
    } = req.body;

    const med = memoryStore.medications.find((m) => m.id === id);
    if (!med) {
      return res.status(404).json({
        success: false,
        message: "Data obat tidak ditemukan.",
      });
    }

    const newLog = {
      id: `medlog-${Date.now()}`,
      medicationId: id,
      medicationName: med.name,
      patientId: med.patientId,
      scheduledTime: scheduledTime || "Waktu Minum Terjadwal",
      takenAt: new Date().toISOString(),
      status, // GIVEN / SKIPPED / CANCELLED
      reason: reason || (status === "GIVEN" ? "Telah diberikan kepada pasien" : "Terlewat"),
      recordedByName,
    };

    memoryStore.medicationLogs.unshift(newLog);
    saveDb();

    return res.status(200).json({
      success: true,
      message: `Status obat "${med.name}" berhasil dicatat sebagai: ${status}.`,
      data: newLog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mencatat log obat.",
    });
  }
};

/**
 * Mengambil riwayat log pemberian obat
 * GET /api/medications/logs?patientId=...
 */
export const getMedicationLogs = async (req, res) => {
  try {
    const patientId = req.query.patientId || memoryStore.patients[0]?.id;
    const logs = memoryStore.medicationLogs.filter((l) => l.patientId === patientId);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat riwayat log obat.",
    });
  }
};

/**
 * Menghapus atau menghentikan resep obat
 * DELETE /api/medications/:id
 */
export const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryStore.medications.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Data obat tidak ditemukan.",
      });
    }

    const deleted = memoryStore.medications.splice(index, 1)[0];
    saveDb();

    return res.status(200).json({
      success: true,
      message: `Obat "${deleted.name}" berhasil dihapus dari jadwal.`,
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus obat.",
    });
  }
};

