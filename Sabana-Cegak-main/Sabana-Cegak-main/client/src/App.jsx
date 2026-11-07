import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PatientPage from "./pages/PatientPage";
import DocumentsPage from "./pages/DocumentsPage";
import VerificationPage from "./pages/VerificationPage";
import MedicationPage from "./pages/MedicationPage";
import CareChecklistPage from "./pages/CareChecklistPage";
import AlertsPage from "./pages/AlertsPage";
import HistoryPage from "./pages/HistoryPage";
import MedicationReminderNotification from "./components/MedicationReminderNotification";
import { getPatients, getCurrentUser, logoutUser, updateCaregiverProfile } from "./services/api";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState("landing"); // 'landing' | 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [medicationUpdateKey, setMedicationUpdateKey] = useState(0);

  // Data hasil AI yang perlu diverifikasi sebelum aktif
  const [pendingVerification, setPendingVerification] = useState(null);

  // Fungsi memuat daftar pasien khusus akun yang login
  const fetchUserPatients = async (preferredPatientId = null) => {
    try {
      const res = await getPatients();
      const patientList = res.data || [];
      setPatients(patientList);
      if (patientList.length > 0) {
        if (preferredPatientId) {
          const match = patientList.find((p) => p.id === preferredPatientId);
          setActivePatient(match || patientList[0]);
        } else {
          setActivePatient((prev) => {
            const exists = patientList.find((p) => p.id === prev?.id);
            if (exists) return exists;
            // Utamakan pasien aktif Ibu Jusmanidar
            const jusmanidar = patientList.find(
              (p) => p.name && p.name.toLowerCase().includes("jusmanidar")
            );
            return jusmanidar || patientList[0];
          });
        }
      } else {
        setActivePatient(null);
      }
      return patientList;
    } catch (e) {
      console.warn("Failed fetching patients:", e.message);
      setPatients([]);
      setActivePatient(null);
      return [];
    }
  };

  // Periksa sesi login yang tersimpan
  useEffect(() => {
    const token = localStorage.getItem("sabana_token");
    if (token) {
      getCurrentUser()
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
            setIsAuthenticated(true);
            fetchUserPatients();
          }
        })
        .catch(() => {
          logoutUser();
          setIsAuthenticated(false);
          setCurrentUser(null);
          setPatients([]);
          setActivePatient(null);
        });
    } else {
      setPatients([]);
      setActivePatient(null);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    fetchUserPatients();
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPatients([]);
    setActivePatient(null);
    setActiveTab("dashboard");
    setAuthView("landing");
  };

  const handleOpenVerification = (aiData, analysisId) => {
    setPendingVerification({ data: aiData, analysisId });
    setActiveTab("verification");
  };

  // ==================== TAMPILAN AUTENTIKASI & LANDING PAGE ====================
  if (!isAuthenticated) {
    if (authView === "landing") {
      return (
        <LandingPage
          onGetStarted={() => setAuthView("login")}
          onGoToLogin={() => setAuthView("login")}
          onGoToRegister={() => setAuthView("register")}
        />
      );
    }

    if (authView === "register") {
      return (
        <RegisterPage
          onRegisterSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setPatients([]);
            setActivePatient(null);
            fetchUserPatients();
          }}
          onSwitchToLogin={() => setAuthView("login")}
          onBackToLanding={() => setAuthView("landing")}
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView("register")}
        onBackToLanding={() => setAuthView("landing")}
      />
    );
  }

  // ==================== TAMPILAN APLIKASI UTAMA (SETELAH LOGIN) ====================
  return (
    <div className="min-h-screen bg-[#F5F7F6] text-slate-800 flex">
      {/* Notifikasi Pengingat Obat Interaktif (Persuasif & Responsif Global) */}
      <MedicationReminderNotification
        activePatient={activePatient}
        currentUser={currentUser}
        onMedicationLogged={() => setMedicationUpdateKey((k) => k + 1)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo(0, 0);
        }}
      />

      {/* 1. Sidebar Navigasi Desktop & Mobile */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo(0, 0);
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Area Konten Utama */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          activePatient={activePatient}
          patients={patients}
          onSelectPatient={(p) => setActivePatient(p)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenUpload={() => setActiveTab("documents")}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardPage
              key={`dashboard-${medicationUpdateKey}`}
              currentUser={currentUser}
              activePatient={activePatient}
              updateTrigger={medicationUpdateKey}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo(0, 0);
              }}
              onOpenUpload={() => setActiveTab("documents")}
            />
          )}

          {activeTab === "patients" && (
            <PatientPage
              currentUser={currentUser}
              activePatient={activePatient}
              onSelectPatient={(p) => setActivePatient(p)}
              onPatientsChange={fetchUserPatients}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsPage
              activePatient={activePatient}
              onOpenVerification={handleOpenVerification}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo(0, 0);
              }}
            />
          )}

          {activeTab === "verification" && (
            <VerificationPage
              rawAiData={pendingVerification?.data}
              analysisId={pendingVerification?.analysisId}
              activePatient={activePatient}
              onVerificationComplete={() => {
                setPendingVerification(null);
                setActiveTab("dashboard");
              }}
              onCancel={() => {
                setPendingVerification(null);
                setActiveTab("dashboard");
              }}
            />
          )}

          {activeTab === "medications" && (
            <MedicationPage
              key={`medications-${medicationUpdateKey}`}
              activePatient={activePatient}
            />
          )}

          {activeTab === "checklists" && (
            <CareChecklistPage activePatient={activePatient} />
          )}

          {activeTab === "alerts" && (
            <AlertsPage activePatient={activePatient} />
          )}

          {activeTab === "history" && (
            <HistoryPage activePatient={activePatient} />
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-1">Pengaturan Akun Pendamping</h2>
              <p className="text-xs text-slate-500 mb-6">Kelola data profil dan preferensi akun keluarga Anda.</p>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const name = form.elements.name.value;
                  const phone = form.elements.phone.value;
                  try {
                    const res = await updateCaregiverProfile({ name, phone });
                    if (res.user) {
                      setCurrentUser(res.user);
                      alert("Profil berhasil diperbarui!");
                    }
                  } catch (err) {
                    alert("Gagal memperbarui profil: " + err.message);
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Caregiver / Pendamping</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={currentUser?.name || ""}
                    className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Terdaftar (ID Akun)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.email || ""}
                    className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 p-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={currentUser?.phone || ""}
                    placeholder="Contoh: 08123456789"
                    className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-600 block">Peran Sistem</span>
                  <span className="text-slate-900 text-sm font-semibold">{currentUser?.role || "FAMILY_CAREGIVER"}</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400">SABANA CEGAK v2.0 • FIRETECH 2026</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100"
                  >
                    Keluar dari Akun
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
