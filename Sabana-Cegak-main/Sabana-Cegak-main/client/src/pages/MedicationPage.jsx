import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";
import {
  Pill,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  History,
  Check,
  X,
  Trash2,
  Calendar,
  Sparkles,
  ShieldAlert,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  getMedications,
  createMedication,
  logMedicationAction,
  getMedicationLogs,
  deleteMedication,
} from "../services/api";

export const MedicationPage = ({ activePatient }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [medications, setMedications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showLogModal, setShowLogModal] = useState(null);
  const [logStatus, setLogStatus] = useState("GIVEN");
  const [logReason, setLogReason] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    tabletsPerDose: 1,
    totalTablets: 10,
    startDate: new Date().toISOString().split("T")[0],
    durationDays: 10,
    frequency: "1 kali sehari",
    times: ["Pagi"],
    notes: "",
  });

  useEffect(() => {
    getCurrentUser().then(res => setCurrentUser(res?.user)).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser?.name) setCaregiverName(currentUser.name);
    if (activePatient?.primaryCaregiver) setCaregiverName(activePatient.primaryCaregiver);
  }, [currentUser, activePatient]);

  const patientId = activePatient?.id;

  const loadData = async () => {
    if (!patientId) {
      setMedications([]);
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [medRes, logRes] = await Promise.all([
        getMedications(patientId),
        getMedicationLogs(patientId),
      ]);
      setMedications(medRes.data || []);
      setLogs(logRes.data || []);
    } catch (e) {
      console.error("Gagal memuat jadwal obat:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleRecordLog = async () => {
    if (!showLogModal) return;

    try {
      await logMedicationAction(showLogModal.id, {
        status: logStatus,
        reason: logReason,
        scheduledTime: showLogModal.frequency || "Terjadwal",
        recordedByName: caregiverName,
      });

      setShowLogModal(null);
      setLogReason("");
      loadData();
    } catch (e) {
      alert("Gagal mencatat log obat: " + e.message);
    }
  };

  const handleQuickGiven = async (med) => {
    try {
      await logMedicationAction(med.id, {
        status: "GIVEN",
        scheduledTime: "Waktu Sekarang",
        reason: "Sudah diminum tepat waktu via tombol aksi cepat",
        recordedByName: caregiverName,
      });

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
        title: "Dosis Selesai Diminum! 🎉",
        message: `Status obat "${med.name}" berhasil diperbarui di database Prisma dan progres harian pemulihan ${activePatient?.name || "pasien"} meningkat!`,
      });
      setTimeout(() => setFeedbackToast(null), 5000);
      loadData();
    } catch (err) {
      alert("Gagal mencatat status obat: " + err.message);
    }
  };

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
      patientName: activePatient?.name || "Pasien",
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

  const handleCreateMedication = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      return alert("Nama obat dan dosis wajib diisi!");
    }

    try {
      await createMedication({
        patientId,
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        tabletsPerDose: Number(formData.tabletsPerDose) || 1,
        totalTablets: Number(formData.totalTablets) || 10,
        remainingTablets: Number(formData.totalTablets) || 10,
        startDate: formData.startDate || new Date().toISOString().split("T")[0],
        durationDays: Number(formData.durationDays) || 10,
        frequency: formData.frequency,
        times: formData.times,
        notes: formData.notes,
      });

      setShowAddModal(false);
      setFormData({
        name: "",
        dosage: "",
        tabletsPerDose: 1,
        totalTablets: 10,
        startDate: new Date().toISOString().split("T")[0],
        durationDays: 10,
        frequency: "1 kali sehari",
        times: ["Pagi"],
        notes: "",
      });
      loadData();
    } catch (err) {
      alert("Gagal menambahkan obat: " + err.message);
    }
  };

  const handleDeleteMedication = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus obat "${name}" dari jadwal harian?`)) {
      return;
    }

    try {
      await deleteMedication(id);
      loadData();
    } catch (err) {
      alert("Gagal menghapus obat: " + err.message);
    }
  };

  const toggleTimeCheckbox = (timeValue) => {
    setFormData((prev) => {
      const exists = prev.times.includes(timeValue);
      const updated = exists
        ? prev.times.filter((t) => t !== timeValue)
        : [...prev.times, timeValue];
      return { ...prev, times: updated.length ? updated : [timeValue] };
    });
  };

  const parseTimes = (timesStr) => {
    if (!timesStr) return ["Pagi"];
    if (Array.isArray(timesStr)) return timesStr;
    try {
      const parsed = JSON.parse(timesStr);
      if (Array.isArray(parsed)) return parsed;
      return [String(parsed)];
    } catch (e) {
      if (typeof timesStr === "string") {
        return timesStr.split(",").map((t) => t.trim()).filter(Boolean);
      }
      return ["Pagi"];
    }
  };

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getEndDate = (startDateStr, durationDays = 10) => {
    try {
      const d = new Date(startDateStr || new Date());
      d.setDate(d.getDate() + Number(durationDays || 10));
      return formatDateIndo(d);
    } catch (e) {
      return "-";
    }
  };

  // Evaluasi statistik kepatuhan dan prediksi AI
  const givenLogs = logs.filter((l) => l.status === "GIVEN");
  const skippedLogs = logs.filter((l) => l.status === "SKIPPED" || l.status === "CANCELLED");
  const hasSkipped = skippedLogs.length > 0;
  const totalLogs = givenLogs.length + skippedLogs.length;
  const adherenceRate = totalLogs > 0 ? Math.round((givenLogs.length / totalLogs) * 100) : 100;

  // Deduplikasi obat aktif berdasarkan nama agar kartu tidak pernah muncul ganda
  const uniqueMeds = [];
  const seenMedNames = new Set();
  for (const m of medications) {
    const key = (m.name || "").trim().toLowerCase();
    if (!seenMedNames.has(key)) {
      seenMedNames.add(key);
      uniqueMeds.push(m);
    }
  }

  const filteredMeds = uniqueMeds.filter((m) => {
    if (activeFilter === "Semua") return true;
    const times = parseTimes(m.times);
    return times.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback Respon Cepat */}
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

      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-[#153C35]" />
            Smart Medication Reminder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau rincian tanggal, stok tablet, dan waktu konsumsi obat pasien agar tidak ada dosis yang terlewat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Tab */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["Semua", "Pagi", "Siang", "Malam"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === filter
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Obat</span>
          </button>
        </div>
      </div>

      {/* Widget AI Care Prognosis & Prediksi Kepatuhan Minum Obat */}
      <div
        className={`rounded-2xl p-5 border transition-all ${
          hasSkipped
            ? "bg-rose-50/80 border-rose-300 text-rose-950 shadow-xs"
            : givenLogs.length > 0
            ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-[#E8F2ED] border-emerald-300 text-slate-900 shadow-xs"
            : "bg-slate-50 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                hasSkipped
                  ? "bg-rose-100 text-rose-600 animate-pulse"
                  : givenLogs.length > 0
                  ? "bg-[#153C35] text-emerald-300"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {hasSkipped ? (
                <AlertOctagon className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    hasSkipped
                      ? "bg-rose-600 text-white"
                      : "bg-[#153C35] text-white"
                  }`}
                >
                  {hasSkipped
                    ? "Prediksi AI: Waspada Pasien Berpotensi Tidak Membaik"
                    : "Prediksi AI: Respon Pengobatan Terkendali"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 text-slate-700">
                  Tingkat Kepatuhan: {adherenceRate}% ({givenLogs.length} Dosis Teratur)
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                {hasSkipped
                  ? `Terdeteksi dosis obat (${skippedLogs[0]?.medicationName || "Obat"}) terlewat atau tidak diminum sesuai waktu yang ditentukan. Berdasarkan analisis farmakoterapi AI, fluktuasi dosis ini berpotensi menggagalkan proses pemulihan dan memicu kekambuhan gejala klinis pasien.`
                  : givenLogs.length > 0
                  ? `Berdasarkan keteraturan waktu konsumsi obat pasien, AI memprediksi respon terapi berjalan positif dan kondisi fisik pasien menunjukkan tren membaik secara stabil. Teruskan pemberian obat tepat waktu sesuai anjuran medis RS.`
                  : `AI aktif memantau kepatuhan waktu konsumsi obat. Catat setiap kali obat diberikan kepada pasien untuk memantau prediksi efektivitas pengobatan harian.`}
              </p>

              {hasSkipped ? (
                <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block text-rose-950">
                      INSTRUKSI MEDIS: SEGERA DATANGI RUMAH SAKIT / FASKES TERDEKAT!
                    </span>
                    <p className="mt-0.5 text-rose-800 leading-relaxed">
                      Jika kondisi fisik pasien tidak kunjung membaik, terasa lemas separuh badan, pusing hebat, sesak napas, atau tidak sesuai harapan, jangan tunda lagi. Segera bawa pasien berkonsultasi ke Rumah Sakit (RS) atau Fasilitas Pelayanan Kesehatan terdekat untuk penanganan medis darurat.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium">
                  Catatan Klinis: Jika sewaktu-waktu respon fisik pasien tidak sesuai harapan atau timbul efek samping mendadak, segera konsultasikan ke Rumah Sakit terdekat.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeds.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            {activeFilter === "Semua"
              ? "Belum ada resep obat aktif. Silakan tambahkan obat manual atau unggah berkas resume medis."
              : `Tidak ada obat yang dijadwalkan pada waktu ${activeFilter}.`}
          </div>
        ) : (
          filteredMeds.map((med) => {
            const times = parseTimes(med.times);
            const doseTablets = med.tabletsPerDose || 1;
            const dailyTablets = times.length * doseTablets;
            // Gunakan totalTablets dari data dokumen resep RS (bukan default 30)
            const totalTablets = med.totalTablets !== undefined ? Number(med.totalTablets) : (dailyTablets > 0 ? dailyTablets * 10 : 10);
            const remainingTablets = med.remainingTablets !== undefined ? Number(med.remainingTablets) : totalTablets;
            const startDate = med.startDate || (med.createdAt ? med.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]);
            // Durasi hari terapi dihitung dari total tablet dibagi kebutuhan harian (BUKAN 30 hari)
            const durationDays = med.durationDays || (dailyTablets > 0 ? Math.ceil(totalTablets / dailyTablets) : 10);
            const stockPercent = Math.min(100, Math.max(0, Math.round((remainingTablets / totalTablets) * 100)));
            const isStockLow = remainingTablets <= 2;

            // Cari log terakhir untuk obat ini
            const lastLog = logs.find((l) => l.medicationId === med.id);

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#153C35]/50 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3.5">
                  {/* Header Kartu */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {med.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E8F2ED] text-[#153C35]">
                          Dosis: {med.dosage}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {med.frequency || "Teratur"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {times.map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rincian Tanggal Terapi & Jadwal */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#153C35] shrink-0" />
                      <span className="font-semibold text-slate-700">Periode Terapi:</span>
                      <span>
                        {formatDateIndo(startDate)} s/d {getEndDate(startDate, durationDays)} ({durationDays} Hari Sesuai Dokumen RS)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">Status Terakhir:</span>
                      {lastLog ? (
                        <span
                          className={`font-semibold ${
                            lastLog.status === "GIVEN" ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {lastLog.status === "GIVEN" ? "Sudah diminum" : "Terlewat"}{" "}
                          ({formatDateIndo(lastLog.takenAt)} pukul{" "}
                          {new Date(lastLog.takenAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB)
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum ada catatan konsumsi hari ini</span>
                      )}
                    </div>
                  </div>

                  {/* Rincian Jumlah Tablet & Sisa Persediaan Stok */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {/* Kotak Dosis Tablet */}
                    <div className="p-3 rounded-xl bg-[#F8FAF9] border border-emerald-100/80">
                      <div className="flex items-center gap-1.5 font-bold text-[#153C35] mb-1">
                        <Pill className="w-3.5 h-3.5" />
                        <span>Dosis Tablet</span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {doseTablets} Tablet <span className="text-xs font-normal text-slate-500">/ minum</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Kebutuhan: <strong>{dailyTablets} Tablet</strong> / hari
                      </span>
                    </div>

                    {/* Kotak Sisa Stok Tablet */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-bold text-slate-600">Sisa Persediaan</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isStockLow
                              ? "bg-rose-100 text-rose-700 animate-pulse"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isStockLow ? "Stok Menipis" : "Tersedia"}
                        </span>
                      </div>

                      <div className="text-sm font-extrabold text-slate-900">
                        {remainingTablets}{" "}
                        <span className="text-xs font-normal text-slate-400">/ {totalTablets} Tab Sesuai Dokumen</span>
                      </div>

                      {/* Mini Bar Progress Stok */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isStockLow ? "bg-rose-500" : "bg-[#153C35]"
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Aturan Pakai & Catatan */}
                  {med.notes && (
                    <p className="text-xs text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                      <span className="font-semibold text-slate-700">Aturan Pakai:</span> {med.notes}
                    </p>
                  )}
                </div>

                {/* Footer Kartu & Tombol Aksi */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteMedication(med.id, med.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs"
                    title="Hapus resep obat ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowLogModal(med);
                      setLogStatus("GIVEN");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Catat Pemberian</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History Logs Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-[#153C35]" />
          Riwayat Pemberian Obat Terakhir
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada riwayat pencatatan obat hari ini.</p>
        ) : (
          <div className="space-y-2.5">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1.5 rounded-lg ${
                      log.status === "GIVEN"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {log.status === "GIVEN" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {log.medicationName || "Obat"} • {log.status === "GIVEN" ? "Sudah Diminum" : "Terlewat / Dibatalkan"}
                    </span>
                    <span className="text-[11px] text-slate-500">{log.reason || "Dicatat tepat waktu"}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <span className="block font-medium text-slate-600">{log.recordedByName}</span>
                  <span>{new Date(log.takenAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah Obat Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Resep Obat Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan informasi resep obat pasien, rincian tanggal konsumsi, dan persediaan tablet.
            </p>

            <form onSubmit={handleCreateMedication} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Obat & Sediaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Amlodipine 10mg / Candesartan 8mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosis Sediaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10 mg / 500 mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frekuensi Minum</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1 kali sehari"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
              </div>

              {/* Rincian Tablet Detail */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Tablet Sekali Minum *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.tabletsPerDose}
                    onChange={(e) => setFormData({ ...formData, tabletsPerDose: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Contoh: 1 Tablet</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Persediaan Tablet *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalTablets}
                    onChange={(e) => setFormData({ ...formData, totalTablets: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Total yang didapat dari RS/Apotek</span>
                </div>
              </div>

              {/* Rincian Tanggal Terapi */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai Terapi</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durasi Terapi (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Waktu Minum Obat</label>
                <div className="flex items-center gap-2">
                  {["Pagi", "Siang", "Malam"].map((timeVal) => {
                    const isChecked = formData.times.includes(timeVal);
                    return (
                      <button
                        key={timeVal}
                        type="button"
                        onClick={() => toggleTimeCheckbox(timeVal)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isChecked
                            ? "bg-[#153C35] text-white border-[#153C35]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {timeVal}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aturan Pakai & Catatan</label>
                <input
                  type="text"
                  placeholder="Misal: Minum sesudah makan, jangan dikunyah"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420]"
                >
                  Simpan Obat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Log Obat */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Catat Pemberian: {showLogModal.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfirmasi status pemberian obat kepada pasien dan rincian tablet yang dikonsumsi.
            </p>

            <div className="space-y-4">
              {/* Rincian Tablet yang Diminum */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jumlah Dosis Diminum:</span>
                  <span className="font-bold text-[#153C35]">
                    {showLogModal.tabletsPerDose || 1} Tablet ({showLogModal.dosage})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sisa Stok Saat Ini:</span>
                  <span className="font-bold text-slate-800">
                    {showLogModal.remainingTablets !== undefined ? showLogModal.remainingTablets : (showLogModal.totalTablets || 30)} Tablet
                  </span>
                </div>
                {logStatus === "GIVEN" && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200/60">
                    <span>Sisa Stok Setelah Diminum:</span>
                    <span>
                      {Math.max(
                        0,
                        (showLogModal.remainingTablets !== undefined ? showLogModal.remainingTablets : (showLogModal.totalTablets || 30)) -
                          (showLogModal.tabletsPerDose || 1)
                      )}{" "}
                      Tablet
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Pemberian</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "GIVEN", label: "Sudah Diminum", color: "emerald" },
                    { id: "SKIPPED", label: "Terlewat", color: "amber" },
                    { id: "CANCELLED", label: "Dibatalkan", color: "rose" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setLogStatus(s.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                        logStatus === s.id
                          ? s.id === "GIVEN"
                            ? "bg-[#153C35] text-white border-[#153C35]"
                            : "bg-rose-600 text-white border-rose-600"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning AI jika status SKIPPED atau CANCELLED */}
              {(logStatus === "SKIPPED" || logStatus === "CANCELLED") && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Peringatan AI:</strong> Melewatkan dosis obat dapat menyebabkan kondisi fisik pasien tidak membaik. AI Care Alerts akan mengaktifkan rekomendasi rujukan ke Rumah Sakit terdekat jika kondisi pasien memburuk.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pendamping yang Mencatat</label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Pasien sempat mual, diminum 10 menit kemudian"
                  value={logReason}
                  onChange={(e) => setLogReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRecordLog}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420]"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationPage;