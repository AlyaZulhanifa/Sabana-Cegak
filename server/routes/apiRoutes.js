import { Router } from "express";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

// Controllers
import { register, login, getMe } from "../controllers/authController.js";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import {
  uploadAndAnalyzeDocument,
  verifyAndActivateCarePlan,
  getDocuments,
} from "../controllers/documentController.js";
import {
  getMedications,
  createMedication,
  logMedication,
  getMedicationLogs,
} from "../controllers/medicationController.js";
import {
  getCareChecklists,
  createCareChecklist,
  completeCareChecklist,
  getCareAlerts,
  resolveCareAlert,
  getCareHistory,
  createCareNote,
} from "../controllers/careController.js";
import {
  getAppointments,
  createAppointment,
  confirmAppointment,
} from "../controllers/appointmentController.js";

const router = Router();

// ==================== 1. HEALTH CHECK ====================
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SABANA CEGAK REST API",
    version: "2.0.0",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    database: "MySQL + In-Memory Hybrid",
    timestamp: new Date().toISOString(),
  });
});

// ==================== 2. AUTHENTICATION ====================
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, getMe);

// ==================== 3. PATIENTS ====================
router.get("/patients", getPatients);
router.get("/patients/:id", getPatientById);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

// ==================== 4. MEDICAL DOCUMENTS & AI EXTRACTION ====================
router.post(
  "/documents/upload",
  uploadMiddleware.single("document"),
  uploadAndAnalyzeDocument
);
// Alias endpoint lama untuk backward compatibility
router.post(
  "/upload-document",
  uploadMiddleware.single("document"),
  uploadAndAnalyzeDocument
);
router.post("/documents/verify", verifyAndActivateCarePlan);
router.get("/documents", getDocuments);

// ==================== 5. SMART MEDICATION REMINDER ====================
router.get("/medications", getMedications);
router.post("/medications", createMedication);
router.post("/medications/:id/log", logMedication);
router.get("/medications/logs", getMedicationLogs);

// ==================== 6. DAILY HOME CARE CHECKLIST & ALERTS ====================
router.get("/care/checklists", getCareChecklists);
router.post("/care/checklists", createCareChecklist);
router.post("/care/checklists/:id/complete", completeCareChecklist);

router.get("/care/alerts", getCareAlerts);
router.put("/care/alerts/:id/resolve", resolveCareAlert);

// ==================== 7. FAMILY CARE MONITORING (HISTORY & NOTES) ====================
router.get("/care/history", getCareHistory);
router.post("/care/notes", createCareNote);

// ==================== 8. FOLLOW-UP APPOINTMENTS (JADWAL KONTROL) ====================
router.get("/appointments", getAppointments);
router.post("/appointments", createAppointment);
router.put("/appointments/:id/confirm", confirmAppointment);

export default router;
