import { memoryStore, saveDb, prisma } from "../config/db.js";

/**
 * Mengambil daftar pasien yang dipantau oleh akun keluarga yang login
 * GET /api/patients
 */
export const getPatients = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // 1. Coba ambil data pasien asli dari Prisma (MySQL)
    if (prisma) {
      try {
        const accesses = await prisma.patientAccess.findMany({
          where: { userId },
          include: { patient: true },
          orderBy: { createdAt: "desc" },
        });

        const list = accesses.map((a) => ({
          ...a.patient,
          userId,
          dischargeDate: a.patient.dischargeDate
            ? a.patient.dischargeDate.toISOString().split("T")[0]
            : null,
          birthDate: a.patient.birthDate
            ? a.patient.birthDate.toISOString().split("T")[0]
            : null,
        }));

        return res.status(200).json({
          success: true,
          data: list,
        });
      } catch (err) {
        console.warn("Prisma query failed, fallback ke memoryStore:", err.message);
      }
    }

    // 2. Fallback memoryStore / JSON disk
    // Mendukung koordinasi keluarga: tampilkan pasien milik user, atau seluruh pasien keluarga
    let patients = memoryStore.patients.filter((p) => p.userId === userId);
    if (patients.length === 0 || !patients.some((p) => p.name && p.name.toLowerCase().includes("jusmanidar"))) {
      patients = memoryStore.patients;
    }

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
    const userId = req.user?.id;

    let patient = null;

    if (prisma) {
      try {
        patient = await prisma.patient.findUnique({
          where: { id },
          include: {
            diagnoses: true,
            medications: { where: { isActive: true } },
            careChecklists: { where: { isActive: true } },
            alerts: { where: { status: "ACTIVE" } },
            access: true,
          },
        });

        if (patient) {
          const hasAccess = patient.access.some((a) => a.userId === userId);
          if (userId && patient.access.length > 0 && !hasAccess) {
            return res.status(403).json({
              success: false,
              message: "Akses ditolak. Anda tidak memiliki izin untuk melihat data pasien ini.",
            });
          }

          return res.status(200).json({
            success: true,
            data: {
              ...patient,
              dischargeDate: patient.dischargeDate ? patient.dischargeDate.toISOString().split("T")[0] : null,
              birthDate: patient.birthDate ? patient.birthDate.toISOString().split("T")[0] : null,
              checklists: patient.careChecklists || [],
            },
          });
        }
      } catch (err) {
        console.warn("Prisma getPatientById failed, fallback to memoryStore:", err.message);
      }
    }

    patient = memoryStore.patients.find((p) => p.id === id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Data pasien tidak ditemukan.",
      });
    }

    if (userId && patient.userId && patient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda tidak memiliki izin untuk melihat data pasien ini.",
      });
    }

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

    const userId = req.user?.id || req.body.userId || null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak valid. Silakan login kembali.",
      });
    }

    let savedPatient = null;

    // Simpan ke Prisma MySQL jika aktif
    if (prisma) {
      try {
        let userInDb = await prisma.user.findUnique({ where: { id: userId } });
        if (!userInDb && req.user?.email) {
          userInDb = await prisma.user.findUnique({ where: { email: req.user.email } });
        }
        if (!userInDb && req.user) {
          userInDb = await prisma.user.create({
            data: {
              id: userId,
              name: req.user.name || primaryCaregiver,
              email: req.user.email || `user_${userId}@cegak.id`,
              password: "SYNCED_PASSWORD",
              role: req.user.role || "FAMILY_CAREGIVER",
            },
          });
        }

        if (userInDb) {
          const newPrismaPatient = await prisma.patient.create({
            data: {
              name: name.trim(),
              birthDate: birthDate ? new Date(birthDate) : null,
              age: age ? parseInt(age) : null,
              gender: gender || "Belum ditentukan",
              dischargeDate: new Date(dischargeDate),
              hospitalName: hospitalName ? hospitalName.trim() : "Rumah Sakit Umum",
              primaryCaregiver: primaryCaregiver.trim(),
              relationship: relationship.trim(),
              access: {
                create: {
                  userId: userInDb.id,
                  role: "PRIMARY",
                },
              },
            },
          });

          savedPatient = {
            ...newPrismaPatient,
            userId: userInDb.id,
            dischargeDate: newPrismaPatient.dischargeDate.toISOString().split("T")[0],
            birthDate: newPrismaPatient.birthDate ? newPrismaPatient.birthDate.toISOString().split("T")[0] : null,
          };
        }
      } catch (err) {
        console.warn("Prisma createPatient failed, fallback to memoryStore:", err.message);
      }
    }

    // Fallback jika belum tersimpan di Prisma
    if (!savedPatient) {
      savedPatient = {
        id: `patient-${Date.now()}`,
        userId,
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
    }

    memoryStore.patients.unshift(savedPatient);
    saveDb();

    return res.status(201).json({
      success: true,
      message: "Profil pasien berhasil ditambahkan ke SABANA CEGAK.",
      data: savedPatient,
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
    const userId = req.user?.id;

    if (prisma) {
      try {
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name.trim();
        if (req.body.age !== undefined) updateData.age = req.body.age ? parseInt(req.body.age) : null;
        if (req.body.gender) updateData.gender = req.body.gender;
        if (req.body.dischargeDate) updateData.dischargeDate = new Date(req.body.dischargeDate);
        if (req.body.birthDate) updateData.birthDate = new Date(req.body.birthDate);
        if (req.body.hospitalName) updateData.hospitalName = req.body.hospitalName.trim();
        if (req.body.primaryCaregiver) updateData.primaryCaregiver = req.body.primaryCaregiver.trim();
        if (req.body.relationship) updateData.relationship = req.body.relationship.trim();

        const updatedPrisma = await prisma.patient.update({
          where: { id },
          data: updateData,
        });

        if (updatedPrisma) {
          const resObj = {
            ...updatedPrisma,
            userId,
            dischargeDate: updatedPrisma.dischargeDate ? updatedPrisma.dischargeDate.toISOString().split("T")[0] : null,
            birthDate: updatedPrisma.birthDate ? updatedPrisma.birthDate.toISOString().split("T")[0] : null,
          };
          return res.status(200).json({
            success: true,
            message: "Profil pasien berhasil diperbarui.",
            data: resObj,
          });
        }
      } catch (err) {
        console.warn("Prisma updatePatient failed, fallback to memoryStore:", err.message);
      }
    }

    const index = memoryStore.patients.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Data pasien tidak ditemukan.",
      });
    }

    const patient = memoryStore.patients[index];
    if (userId && patient.userId && patient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda tidak berhak memperbarui data pasien ini.",
      });
    }

    const updated = {
      ...patient,
      ...req.body,
      id: patient.id,
      userId: patient.userId || userId,
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

    if (prisma) {
      try {
        await prisma.patient.delete({ where: { id } });
      } catch (err) {
        // Abaikan jika tidak di Prisma
      }
    }

    const index = memoryStore.patients.findIndex((p) => p.id === id);
    if (index !== -1) {
      memoryStore.patients.splice(index, 1);
      saveDb();
    }

    return res.status(200).json({
      success: true,
      message: "Profil pasien telah dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus data pasien.",
    });
  }
};
