import { Router } from "express";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

// Controllers
import { register, login, getMe, updateProfile } from "../controllers/authController.js";
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
  getDocumentFile,
  startManualCarePlan,
} from "../controllers/documentController.js";
import {
  getMedications,
  createMedication,
  logMedication,
  getMedicationLogs,
  deleteMedication,
} from "../controllers/medicationController.js";
import {
  getCareChecklists,
  createCareChecklist,
  completeCareChecklist,
  deleteCareChecklist,
  getCareAlerts,
  resolveCareAlert,
  getCareHistory,
  createCareNote,
} from "../controllers/careController.js";

const router = Router();

// ==================== 1. HEALTH CHECK ====================
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SABANA CEGAK REST API",
    version: "2.0.0",
    geminiConfigured: !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("kunci_gemini")),
    database: "Persistent File Store (JSON)",
    timestamp: new Date().toISOString(),
  });
});

// ==================== 2. AUTHENTICATION ====================
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, getMe);
router.put("/auth/profile", requireAuth, updateProfile);

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
router.post(
  "/upload-document",
  uploadMiddleware.single("document"),
  uploadAndAnalyzeDocument
);
router.post("/documents/manual-entry", startManualCarePlan);
router.post("/documents/verify", verifyAndActivateCarePlan);
router.get("/documents", getDocuments);
router.get("/documents/file/:id", getDocumentFile);

// ==================== 5. SMART MEDICATION REMINDER ====================
router.get("/medications", getMedications);
router.post("/medications", createMedication);
router.post("/medications/:id/log", logMedication);
router.get("/medications/logs", getMedicationLogs);
router.delete("/medications/:id", deleteMedication);

// ==================== 6. DAILY HOME CARE CHECKLIST & ALERTS ====================
router.get("/care/checklists", getCareChecklists);
router.post("/care/checklists", createCareChecklist);
router.post("/care/checklists/:id/complete", completeCareChecklist);
router.delete("/care/checklists/:id", deleteCareChecklist);

router.get("/care/alerts", getCareAlerts);
router.put("/care/alerts/:id/resolve", resolveCareAlert);

// ==================== 7. FAMILY CARE MONITORING (HISTORY & NOTES) ====================
router.get("/care/history", getCareHistory);
router.post("/care/notes", createCareNote);

export default router;
