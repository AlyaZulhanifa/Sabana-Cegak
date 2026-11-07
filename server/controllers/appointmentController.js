import { memoryStore } from "../config/db.js";

/**
 * Mengambil daftar jadwal kontrol rumah sakit untuk pasien
 * GET /api/appointments?patientId=...
 */
export const getAppointments = async (req, res) => {
  try {
    const patientId = req.query.patientId;
    if (!patientId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
    const appointments = memoryStore.appointments.filter((a) => a.patientId === patientId);

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat jadwal kontrol.",
    });
  }
};

/**
 * Menambahkan jadwal kontrol baru
 * POST /api/appointments
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      patientId = "patient-demo-1",
      appointmentDate,
      appointmentTime = "09:00 WIB",
      hospitalName = "RSUD Rujukan",
      clinicOrDoctor,
      notes,
    } = req.body;

    if (!appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal kontrol wajib diisi.",
      });
    }

    const newApp = {
      id: `app-${Date.now()}`,
      patientId,
      appointmentDate,
      appointmentTime,
      hospitalName,
      clinicOrDoctor: clinicOrDoctor || "Poli Spesialis",
      notes: notes || "",
      isConfirmed: true,
      reminderH3Sent: false,
      reminderH1Sent: false,
      reminderDaySent: false,
      createdAt: new Date().toISOString(),
    };

    memoryStore.appointments.unshift(newApp);

    return res.status(201).json({
      success: true,
      message: "Jadwal kontrol berhasil disimpan.",
      data: newApp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan jadwal kontrol.",
    });
  }
};

/**
 * Mengonfirmasi jadwal kontrol
 * PUT /api/appointments/:id/confirm
 */
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const app = memoryStore.appointments.find((a) => a.id === id);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "Jadwal kontrol tidak ditemukan.",
      });
    }

    app.isConfirmed = true;

    return res.status(200).json({
      success: true,
      message: "Jadwal kontrol telah dikonfirmasi oleh keluarga.",
      data: app,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengonfirmasi jadwal.",
    });
  }
};

