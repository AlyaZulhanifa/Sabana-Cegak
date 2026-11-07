import { memoryStore, saveDb } from "../config/db.js";

/**
 * Mengambil daftar checklist aktivitas harian perawatan rumah
 * GET /api/care/checklists?patientId=...
 */
export const getCareChecklists = async (req, res) => {
  try {
    let patientId = req.query.patientId;
    if (!patientId) {
      const defaultPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
      patientId = defaultPatient?.id;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const checklists = memoryStore.careChecklists
      .filter((c) => (!patientId || c.patientId === patientId) && c.isActive)
      .map((c) => {
        // Cek apakah aktivitas ini sudah diselesaikan hari ini
        const isDoneToday = memoryStore.careChecklistLogs.some(
          (log) =>
            log.careChecklistId === c.id &&
            log.status === "COMPLETED" &&
            log.completedAt?.startsWith(todayStr)
        );
        return {
          ...c,
          isCompletedToday: isDoneToday,
        };
      });

    return res.status(200).json({
      success: true,
      data: checklists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat checklist perawatan.",
    });
  }
};

/**
 * Menambahkan aktivitas checklist perawatan baru secara manual
 * POST /api/care/checklists
 */
export const createCareChecklist = async (req, res) => {
  try {
    let {
      patientId,
      title,
      category = "Lainnya",
      description,
      frequency = "Setiap Hari",
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Nama aktivitas checklist wajib diisi.",
      });
    }

    if (!patientId) {
      const defaultPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
      patientId = defaultPatient?.id || "827c114e-60af-41dd-a618-6aed07229be4";
    }

    const newChk = {
      id: `chk-${Date.now()}`,
      patientId,
      title: title.trim(),
      category: category.trim(),
      description: description ? description.trim() : title.trim(),
      frequency,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    memoryStore.careChecklists.push(newChk);

    // Catat log manual ke riwayat perawatan
    memoryStore.careNotes.unshift({
      id: `note-${Date.now()}`,
      patientId,
      authorName: "Keluarga Pendamping",
      category: "Instruksi Perawatan Manual",
      content: `Aktivitas "${newChk.title}" (${newChk.category}) ditambahkan manual ke checklist panduan harian pasien.`,
      createdAt: new Date().toISOString(),
    });

    saveDb();

    return res.status(201).json({
      success: true,
      message: `Aktivitas "${newChk.title}" berhasil ditambahkan.`,
      data: newChk,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan checklist.",
    });
  }
};

/**
 * Mencatat penyelesaian aktivitas checklist oleh keluarga
 * POST /api/care/checklists/:id/complete
 * Status: COMPLETED / SKIPPED
 */
export const completeCareChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status = "COMPLETED",
      reason,
      recordedByName = "Caregiver",
    } = req.body;

    const checklist = memoryStore.careChecklists.find((c) => c.id === id);
    if (!checklist) {
      return res.status(404).json({
        success: false,
        message: "Aktivitas checklist tidak ditemukan.",
      });
    }

    const newLog = {
      id: `chklog-${Date.now()}`,
      careChecklistId: id,
      title: checklist.title,
      category: checklist.category,
      patientId: checklist.patientId,
      completedAt: new Date().toISOString(),
      status, // COMPLETED / SKIPPED
      reason:
        reason ||
        (status === "COMPLETED" ? "Aktivitas telah selesai dilakukan" : "Dilewati"),
      recordedByName,
    };

    memoryStore.careChecklistLogs.unshift(newLog);
    saveDb();

    return res.status(200).json({
      success: true,
      message: `Aktivitas "${checklist.title}" dicatat sebagai ${status}.`,
      data: newLog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mencatat log checklist.",
    });
  }
};

/**
 * Mengambil daftar AI Care Alerts (Peringatan Keselamatan)
 * GET /api/care/alerts?patientId=...
 */
export const getCareAlerts = async (req, res) => {
  try {
    let patientId = req.query.patientId;
    if (!patientId) {
      const defaultPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
      patientId = defaultPatient?.id;
    }

    const alerts = memoryStore.careAlerts.filter(
      (a) => !patientId || a.patientId === patientId
    );

    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat peringatan AI.",
    });
  }
};

/**
 * Menandai peringatan AI sebagai terselesaikan / dikonfirmasi
 * PUT /api/care/alerts/:id/resolve
 */
export const resolveCareAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = memoryStore.careAlerts.find((a) => a.id === id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Peringatan tidak ditemukan.",
      });
    }

    alert.status = "RESOLVED";
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = req.body.resolvedBy || "Keluarga Pendamping";
    saveDb();

    return res.status(200).json({
      success: true,
      message: "Peringatan telah ditandai sebagai terselesaikan.",
      data: alert,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status alert.",
    });
  }
};

/**
 * Family Care Monitoring (Riwayat Perawatan Gabungan)
 * GET /api/care/history?patientId=...
 */
export const getCareHistory = async (req, res) => {
  try {
    let patientId = req.query.patientId;
    if (!patientId) {
      const defaultPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
      patientId = defaultPatient?.id;
    }

    const medLogs = memoryStore.medicationLogs
      .filter((l) => !patientId || l.patientId === patientId)
      .map((l) => ({
        type: "MEDICATION",
        id: l.id,
        title: `Pemberian Obat: ${l.medicationName || "Obat"}`,
        subtitle: `Jadwal: ${l.scheduledTime} • Status: ${l.status}`,
        status: l.status,
        reason: l.reason,
        author: l.recordedByName || "Pendamping",
        timestamp: l.takenAt,
      }));

    const chkLogs = memoryStore.careChecklistLogs
      .filter((l) => !patientId || l.patientId === patientId)
      .map((l) => ({
        type: "CHECKLIST",
        id: l.id,
        title: `Aktivitas: ${l.title || "Perawatan"}`,
        subtitle: `Kategori: ${l.category || "Umum"} • Status: ${l.status}`,
        status: l.status,
        reason: l.reason,
        author: l.recordedByName || "Pendamping",
        timestamp: l.completedAt,
      }));

    const notes = memoryStore.careNotes
      .filter((n) => !patientId || n.patientId === patientId)
      .map((n) => ({
        type: "NOTE",
        id: n.id,
        title: `Catatan Koordinasi (${n.category})`,
        subtitle: n.content,
        status: "INFO",
        reason: null,
        author: n.authorName || "Keluarga",
        timestamp: n.createdAt,
      }));

    // Urutkan secara kronologis terbalik (terbaru di atas)
    const combined = [...medLogs, ...chkLogs, ...notes].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      success: true,
      data: combined,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat linimasa riwayat perawatan.",
    });
  }
};

/**
 * Menambahkan catatan koordinasi keluarga
 * POST /api/care/notes
 */
export const createCareNote = async (req, res) => {
  try {
    let {
      patientId,
      authorName = "Caregiver",
      category = "Perkembangan Harian",
      content,
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Isi catatan tidak boleh kosong.",
      });
    }

    if (!patientId) {
      const defaultPatient =
        memoryStore.patients.find(
          (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
        ) || memoryStore.patients[0];
      patientId = defaultPatient?.id || "827c114e-60af-41dd-a618-6aed07229be4";
    }

    const newNote = {
      id: `note-${Date.now()}`,
      patientId,
      authorName,
      category,
      content,
      createdAt: new Date().toISOString(),
    };

    memoryStore.careNotes.unshift(newNote);
    saveDb();

    return res.status(201).json({
      success: true,
      message: "Catatan koordinasi keluarga berhasil ditambahkan.",
      data: newNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan catatan.",
    });
  }
};

/**
 * Menghapus aktivitas checklist perawatan
 * DELETE /api/care/checklists/:id
 */
export const deleteCareChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryStore.careChecklists.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Aktivitas checklist tidak ditemukan.",
      });
    }

    const deleted = memoryStore.careChecklists.splice(index, 1)[0];
    saveDb();

    return res.status(200).json({
      success: true,
      message: `Aktivitas "${deleted.title}" berhasil dihapus.`,
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus checklist.",
    });
  }
};
