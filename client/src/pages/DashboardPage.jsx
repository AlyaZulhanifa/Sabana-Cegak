import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Pill,
  ClipboardCheck,
  ShieldAlert,
  CalendarDays,
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
  getAppointments,
  getCareHistory,
} from "../services/api";

export const DashboardPage = ({
  currentUser,
  activePatient,
  onNavigate,
  onOpenUpload,
}) => {
  const [medications, setMedications] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const patientId = activePatient?.id || "patient-demo-1";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [medRes, chkRes, alertRes, appRes, histRes] = await Promise.all([
          getMedications(patientId),
          getCareChecklists(patientId),
          getCareAlerts(patientId),
          getAppointments(patientId),
          getCareHistory(patientId),
        ]);

        setMedications(medRes.data || []);
        setChecklists(chkRes.data || []);
        setAlerts(alertRes.data || []);
        setAppointments(appRes.data || []);
        setRecentActivities((histRes.data || []).slice(0, 4));
      } catch (err) {
        console.error("Gagal memuat data dasbor:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [patientId]);

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const upcomingAppointment = appointments[0] || null;

  return (
    <div className="space-y-6">
      {/* 1. Sapaan Pengguna & Ringkasan Pasien */}
      <div className="bg-gradient-to-r from-[#153C35] via-[#1a4a41] to-[#0c2420] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pendamping Pasien di Rumah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat Datang, {currentUser?.name || "Siti Rahma"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 max-w-xl">
              Memantau pemulihan: <strong>{activePatient?.name || "Ibu Siti"}</strong> ({activePatient?.age || 58} thn) • Pulang RS sejak {activePatient?.dischargeDate || "4 Nov 2026"}.
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

        {/* Card 4: Jadwal Kontrol */}
        <div
          onClick={() => onNavigate("appointments")}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#153C35] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <CalendarDays className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-400">Kunjungan</span>
          </div>
          <div className="text-sm font-black text-slate-900 truncate">
            {upcomingAppointment ? upcomingAppointment.appointmentDate : "Belum Dijadwalkan"}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Kontrol Ulang RS</span>
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
              {medications.slice(0, 3).map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-[#153C35]">Dosis: {med.dosage}</span>
                      <span className="text-[11px] text-slate-400">• {med.frequency}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate("medications")}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8F2ED] text-[#153C35] hover:bg-[#153C35] hover:text-white transition-colors"
                  >
                    Catat
                  </button>
                </div>
              ))}
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

        {/* Kolom Kanan: Jadwal Kontrol & Aktivitas Terbaru (1 Col) */}
        <div className="space-y-6">
          {/* Card Jadwal Kontrol Terdekat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-[#153C35]" />
              <span>Jadwal Kontrol Terdekat</span>
            </h2>

            {upcomingAppointment ? (
              <div className="p-4 rounded-xl bg-[#E8F2ED]/60 border border-emerald-200">
                <span className="text-lg font-black text-[#153C35] block">
                  {upcomingAppointment.appointmentDate}
                </span>
                <span className="text-xs font-semibold text-emerald-900 block mt-1">
                  {upcomingAppointment.appointmentTime || "09:00 WIB"}
                </span>
                <span className="text-xs text-slate-600 block mt-1">
                  {upcomingAppointment.hospitalName} • {upcomingAppointment.clinicOrDoctor}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Belum ada tanggal kontrol yang tercatat.</p>
            )}
          </div>

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
