import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Pill,
  ClipboardCheck,
  ShieldAlert,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Users,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  getMedications,
  getCareChecklists,
  getCareAlerts,
  getCareHistory,
  getMedicationLogs,
  logMedicationAction,
} from "../services/api";

export const DashboardPage = ({
  currentUser,
  activePatient,
  updateTrigger,
  onNavigate,
  onOpenUpload,
}) => {
  const [medications, setMedications] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [dailyProgress, setDailyProgress] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const patientId = activePatient?.id;
  const caregiverName = currentUser?.name || activePatient?.primaryCaregiver || "Caregiver";
  const patientName = activePatient?.name || "Pasien";

  const fetchDashboardData = async () => {
    if (!patientId) {
      setMedications([]);
      setMedLogs([]);
      setDailyProgress(null);
      setChecklists([]);
      setAlerts([]);
      setRecentActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [medRes, chkRes, alertRes, histRes, logRes] = await Promise.all([
        getMedications(patientId),
        getCareChecklists(patientId),
        getCareAlerts(patientId),
        getCareHistory(patientId),
        getMedicationLogs(patientId),
      ]);

      setMedications(medRes.data || []);
      setDailyProgress(medRes.dailyProgress || null);
      setMedLogs(logRes.data || []);
      setChecklists(chkRes.data || []);
      setAlerts(alertRes.data || []);
      setRecentActivities((histRes.data || []).slice(0, 4));
    } catch (err) {
      console.error("Gagal memuat data dasbor:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [patientId, updateTrigger]);

  // Aksi Cepat: Sudah Diminum
  const handleQuickLog = async (med) => {
    try {
      await logMedicationAction(med.id, {
        status: "GIVEN",
        scheduledTime: "Waktu Sekarang",
        reason: "Sudah diminum via tombol aksi cepat Dasbor",
        recordedByName: caregiverName,
      });

      // Bersihkan jadwal tunda di localStorage jika ada
      try {
        const saved = localStorage.getItem("sabana_rescheduled_meds");
        if (saved) {
          const list = JSON.parse(saved);
          const filtered = list.filter((r) => r.medId !== med.id);
          localStorage.setItem("sabana_rescheduled_meds", JSON.stringify(filtered));
        }
      } catch (e) {}

      setFeedbackToast({
        type: "success",
        title: "Dosis Berhasil Dicatat! 🎉",
        message: `Status obat "${med.name}" berhasil dicatat selesai. Progres harian pemulihan ${patientName} diperbarui!`,
      });
      setTimeout(() => setFeedbackToast(null), 4000);

      fetchDashboardData();
    } catch (e) {
      alert("Gagal mencatat status obat: " + e.message);
    }
  };

  // Aksi Cepat: Ingatkan 15 Menit Lagi
  const handleQuickReschedule = (med) => {
    const remindAt = Date.now() + 15 * 60 * 1000;
    const item = {
      medId: med.id,
      medName: med.name,
      dosage: med.dosage,
      tabletsPerDose: med.tabletsPerDose || 1,
      notes: med.notes,
      scheduledTime: med.frequency || "Waktu Terjadwal",
      remindAt,
      isUrgent: true,
      patientId,
      patientName,
    };

    try {
      const saved = localStorage.getItem("sabana_rescheduled_meds");
      const list = saved ? JSON.parse(saved) : [];
      const updated = [...list.filter((r) => r.medId !== med.id), item];
      localStorage.setItem("sabana_rescheduled_meds", JSON.stringify(updated));
    } catch (e) {}

    setFeedbackToast({
      type: "warning",
      title: "Pengingat Dijadwalkan Ulang (15 Menit) ⏰",
      message: `Kami akan memunculkan pop-up peringatan persis 15 menit lagi dengan status mendesak untuk obat "${med.name}".`,
    });
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayGivenLogs = medLogs.filter(
    (l) => l.status === "GIVEN" && new Date(l.takenAt) >= todayStart
  );
  const completedTodayCount = todayGivenLogs.length;
  const totalMedCount = medications.length;
  const progressPercent =
    dailyProgress?.percent !== undefined
      ? dailyProgress.percent
      : totalMedCount > 0
      ? Math.min(100, Math.round((completedTodayCount / totalMedCount) * 100))
      : 100;

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {/* Toast Feedback Dasbor */}
      {feedbackToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
              feedbackToast.type === "success"
                ? "bg-emerald-950/95 border-emerald-500 text-white"
                : "bg-amber-950/95 border-amber-500 text-white"
            }`}
          >
            {feedbackToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-xs font-bold">{feedbackToast.title}</h4>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                {feedbackToast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Sapaan Pengguna & Ringkasan Pasien */}
      <div className="bg-gradient-to-r from-[#153C35] via-[#1a4a41] to-[#0c2420] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pendamping Pasien di Rumah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat Datang, {currentUser?.name || "Caregiver"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 max-w-xl">
              {activePatient ? (
                <>
                  Memantau pemulihan: <strong>{activePatient.name}</strong> ({activePatient.age || "-"} thn) • Pulang RS sejak {activePatient.dischargeDate || "-"}.
                </>
              ) : (
                "Belum ada profil pasien yang dipantau pada akun ini."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("documents")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#E8F2ED] text-[#153C35] hover:bg-white transition-all shadow-sm active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah Dokumen Medis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner Peringatan jika belum ada pasien */}
      {!activePatient && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-sm">Belum Ada Profil Pasien Terpilih</p>
              <p className="text-xs text-amber-700">
                Silakan buat profil pasien keluarga yang Anda dampingi terlebih dahulu agar jadwal obat, checklist harian, dan peringatan keselamatan dapat aktif.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("patients")}
            className="px-4 py-2 bg-[#153C35] text-white font-bold text-xs rounded-xl hover:bg-[#0c2420] transition-colors shrink-0"
          >
            Tambah / Kelola Pasien
          </button>
        </div>
      )}

      {/* 2. Status Perawatan Hari Ini (4 Key Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Obat Aktif */}
        <div
          onClick={() => onNavigate("medications")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#153C35] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-teal-50 text-[#153C35]">
              <Pill className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-400">Jadwal</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{medications.length} Obat</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Resep Aktif Terjadwal</span>
        </div>

        {/* Card 2: Checklist Harian */}
        <div
          onClick={() => onNavigate("checklists")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#153C35] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-400">Hari Ini</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{checklists.length} Instruksi</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Luka, Nutrisi, Aktivitas</span>
        </div>

        {/* Card 3: AI Care Alerts */}
        <div
          onClick={() => onNavigate("alerts")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-600">Audit AI</span>
          </div>
          <div className="text-2xl font-black text-amber-950">{activeAlerts.length} Perhatian</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Zero Medical Hallucination</span>
        </div>

        {/* Card 4: Progres Kepatuhan Minum Obat Hari Ini */}
        <div
          onClick={() => onNavigate("medications")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#153C35] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </span>
              <span className="text-xs font-bold text-slate-400">Kepatuhan</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{progressPercent}%</div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              {completedTodayCount} dari {totalMedCount} Dosis Selesai
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-[#153C35] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. AI Care Alerts Banner (jika ada peringatan aktif) */}
      {activeAlerts.length > 0 && (
        <div
          onClick={() => onNavigate("alerts")}
          className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 cursor-pointer hover:bg-amber-100/60 transition-colors flex items-start gap-3.5"
        >
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Peringatan Keselamatan AI Aktif ({activeAlerts.length})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                Perlu Perhatian
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-medium mt-1">
              {activeAlerts[0]?.message}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-700 shrink-0 self-center" />
        </div>
      )}

      {/* 4. Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Jadwal Obat Berikutnya & Checklist Hari Ini (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Jadwal Obat Pasien */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#153C35]" />
                Jadwal Obat Aktif Hari Ini
              </h2>
              <button
                onClick={() => onNavigate("medications")}
                className="text-xs font-bold text-[#153C35] hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {medications.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Belum ada resep obat aktif.</p>
              ) : (
                medications.slice(0, 4).map((med) => {
                  const isGivenToday = medLogs.some(
                    (l) =>
                      l.medicationId === med.id &&
                      l.status === "GIVEN" &&
                      new Date(l.takenAt) >= todayStart
                  );

                  return (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                          {isGivenToday && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Selesai Diminum</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-[#153C35]">Dosis: {med.dosage}</span>
                          <span className="text-[11px] text-slate-400">• {med.frequency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isGivenToday ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickLog(med)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#153C35] text-white hover:bg-[#0c2420] transition-colors flex items-center gap-1 shadow-2xs"
                              title="Tandai dosis obat sudah diminum sekarang"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sudah Diminum</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickReschedule(med)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1"
                              title="Ingatkan kembali persis 15 menit lagi dengan status mendesak"
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ingatkan 15 Menit Lagi</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onNavigate("medications")}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            Lihat Detail
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: Progress Checklist Harian */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#153C35]" />
                Checklist Instruksi Perawatan Pasien
              </h2>
              <button
                onClick={() => onNavigate("checklists")}
                className="text-xs font-bold text-[#153C35] hover:underline flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {checklists.slice(0, 3).map((chk) => (
                <div
                  key={chk.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3"
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2ED] text-[#153C35] shrink-0 mt-0.5">
                    {chk.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">{chk.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{chk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Aktivitas Terbaru (1 Col) */}
        <div className="space-y-6">
          {/* Card Aktivitas Perawatan Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#153C35]" />
              <span>Aktivitas Perawatan Terbaru</span>
            </h2>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada catatan aktivitas.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="text-xs border-b border-slate-100 pb-2.5 last:border-none">
                    <span className="font-bold text-slate-800 block">{act.title}</span>
                    <span className="text-[11px] text-slate-500">{act.author} • {new Date(act.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
