import { memoryStore, saveDb } from "../config/db.js";

/**
 * Mengambil daftar pasien yang dipantau oleh akun keluarga
 * GET /api/patients
 */
export const getPatients = async (req, res) => {
  try {
    const patients = memoryStore.patients;
    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pasien.",
    });
  }
};

/**
 * Mengambil detail pasien spesifik beserta ringkasan status perawatannya
 * GET /api/patients/:id
 */
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = memoryStore.patients.find((p) => p.id === id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Data pasien tidak ditemukan.",
      });
    }

    // Ambil data relasi pasien
    const diagnoses = memoryStore.diagnoses.filter((d) => d.patientId === id);
    const medications = memoryStore.medications.filter((m) => m.patientId === id && m.isActive);
    const checklists = memoryStore.careChecklists.filter((c) => c.patientId === id && c.isActive);
    const alerts = memoryStore.careAlerts.filter((a) => a.patientId === id && a.status === "ACTIVE");

    return res.status(200).json({
      success: true,
      data: {
        ...patient,
        diagnoses,
        medications,
        checklists,
        alerts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat profil pasien.",
    });
  }
};

/**
 * Membuat profil pasien baru pasca rawat jalan
 * POST /api/patients
 */
export const createPatient = async (req, res) => {
  try {
    const {
      name,
      birthDate,
      age,
      gender,
      dischargeDate,
      hospitalName,
      primaryCaregiver,
      relationship,
    } = req.body;

    // Validasi input wajib
    if (!name || !dischargeDate || !primaryCaregiver || !relationship) {
      return res.status(400).json({
        success: false,
        message:
          "Nama pasien, tanggal keluar RS, nama pendamping, dan hubungan keluarga wajib diisi.",
      });
    }

    const newPatient = {
      id: `patient-${Date.now()}`,
      name: name.trim(),
      birthDate: birthDate || null,
      age: age ? parseInt(age) : null,
      gender: gender || "Belum ditentukan",
      dischargeDate,
      hospitalName: hospitalName ? hospitalName.trim() : "Rumah Sakit Umum",
      primaryCaregiver: primaryCaregiver.trim(),
      relationship: relationship.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.patients.unshift(newPatient);
    saveDb();

    return res.status(201).json({
      success: true,
      message: "Profil pasien berhasil ditambahkan ke SABANA CEGAK.",
      data: newPatient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan data pasien baru.",
    });
  }
};

/**
 * Memperbarui data profil pasien
 * PUT /api/patients/:id
 */
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryStore.patients.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Data pasien tidak ditemukan.",
      });
    }

    const updated = {
      ...memoryStore.patients[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    memoryStore.patients[index] = updated;
    saveDb();

    return res.status(200).json({
      success: true,
      message: "Profil pasien berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui data pasien.",
    });
  }
};

/**
 * Menghapus profil pasien
 * DELETE /api/patients/:id
 */
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryStore.patients.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Data pasien tidak ditemukan.",
      });
    }

    const deleted = memoryStore.patients.splice(index, 1)[0];
    saveDb();

    return res.status(200).json({
      success: true,
      message: `Profil pasien "${deleted.name}" telah dihapus.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus data pasien.",
    });
  }
};

