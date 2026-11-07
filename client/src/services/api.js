import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Interceptor untuk menambahkan Bearer Token jika tersimpan di localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sabana_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== 1. AUTENTIKASI ====================
export const registerUser = async (data) => {
  const res = await apiClient.post("/auth/register", data);
  if (res.data?.token) {
    localStorage.setItem("sabana_token", res.data.token);
  }
  return res.data;
};

export const loginUser = async (data) => {
  const res = await apiClient.post("/auth/login", data);
  if (res.data?.token) {
    localStorage.setItem("sabana_token", res.data.token);
  }
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("sabana_token");
};

export const getCurrentUser = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

export const updateCaregiverProfile = async (data) => {
  const res = await apiClient.put("/auth/profile", data);
  return res.data;
};

// ==================== 2. DATA PASIEN ====================
export const getPatients = async () => {
  const res = await apiClient.get("/patients");
  return res.data;
};

export const getPatientById = async (id) => {
  const res = await apiClient.get(`/patients/${id}`);
  return res.data;
};

export const createPatient = async (data) => {
  const res = await apiClient.post("/patients", data);
  return res.data;
};

export const updatePatient = async (id, data) => {
  const res = await apiClient.put(`/patients/${id}`, data);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await apiClient.delete(`/patients/${id}`);
  return res.data;
};

// ==================== 3. DOKUMEN MEDIS & AI ====================
export const uploadMedicalDocument = async (file, patientId, onProgress) => {
  const formData = new FormData();
  formData.append("document", file);
  if (patientId) formData.append("patientId", patientId);

  const res = await apiClient.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return res.data;
};

export const startManualCarePlan = async (data) => {
  const res = await apiClient.post("/documents/manual-entry", data);
  return res.data;
};

export const verifyCarePlan = async (payload) => {
  const res = await apiClient.post("/documents/verify", payload);
  return res.data;
};

export const getPatientDocuments = async (patientId) => {
  const res = await apiClient.get(`/documents?patientId=${patientId}`);
  return res.data;
};

export const getDocumentFileUrl = (id) => `${API_BASE_URL}/documents/file/${id}`;

// ==================== 4. JADWAL OBAT ====================
export const getMedications = async (patientId) => {
  const res = await apiClient.get(`/medications?patientId=${patientId}`);
  return res.data;
};

export const createMedication = async (data) => {
  const res = await apiClient.post("/medications", data);
  return res.data;
};

export const logMedicationAction = async (medicationId, payload) => {
  const res = await apiClient.post(`/medications/${medicationId}/log`, payload);
  return res.data;
};

export const getMedicationLogs = async (patientId) => {
  const res = await apiClient.get(`/medications/logs?patientId=${patientId}`);
  return res.data;
};

export const deleteMedication = async (id) => {
  const res = await apiClient.delete(`/medications/${id}`);
  return res.data;
};

// ==================== 5. CHECKLIST PERAWATAN & AI ALERTS ====================
export const getCareChecklists = async (patientId) => {
  const res = await apiClient.get(`/care/checklists?patientId=${patientId}`);
  return res.data;
};

export const createCareChecklist = async (data) => {
  const res = await apiClient.post("/care/checklists", data);
  return res.data;
};

export const completeCareChecklist = async (checklistId, payload) => {
  const res = await apiClient.post(`/care/checklists/${checklistId}/complete`, payload);
  return res.data;
};

export const deleteCareChecklist = async (id) => {
  const res = await apiClient.delete(`/care/checklists/${id}`);
  return res.data;
};

export const getCareAlerts = async (patientId) => {
  const res = await apiClient.get(`/care/alerts?patientId=${patientId}`);
  return res.data;
};

export const resolveCareAlert = async (alertId, payload) => {
  const res = await apiClient.put(`/care/alerts/${alertId}/resolve`, payload);
  return res.data;
};

// ==================== 6. RIWAYAT MONITORING KELUARGA ====================
export const getCareHistory = async (patientId) => {
  const res = await apiClient.get(`/care/history?patientId=${patientId}`);
  return res.data;
};

export const createCareNote = async (data) => {
  const res = await apiClient.post("/care/notes", data);
  return res.data;
};

// ==================== 8. SERVER HEALTH ====================
export const checkHealth = async () => {
  try {
    const res = await apiClient.get("/health");
    return res.data;
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export default apiClient;
