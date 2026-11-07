import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";
import { getMedications, getMedicationLogs, logMedicationAction } from "../services/api";

/**
 * Web Audio API Chime untuk notifikasi suara tanpa dependensi file eksternal
 */
const playNotificationChime = (isUrgent = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = isUrgent ? "sawtooth" : "sine";
    osc1.frequency.setValueAtTime(isUrgent ? 660 : 523.25, now); // E5 or C5
    osc1.frequency.exponentialRampToValueAtTime(isUrgent ? 880 : 659.25, now + 0.15);

    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);

    if (isUrgent) {
      // Bunyi ganda untuk peringatan mendesak
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(880, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6
      gain2.gain.setValueAtTime(0.18, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.55);
    }
  } catch (e) {
    // Abaikan jika browser memblokir autoplay audio
  }
};

export const MedicationReminderNotification = ({
  activePatient,
  currentUser,
  onMedicationLogged,
  onNavigate,
}) => {
  const [activeReminder, setActiveReminder] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [rescheduledMeds, setRescheduledMeds] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const patientId = activePatient?.id;
  const caregiverName = currentUser?.name || activePatient?.primaryCaregiver || "Caregiver";
  const patientName = activePatient?.name || "Pasien";

  // Muat jadwal tunda 15 menit yang tersimpan di localStorage
  const loadRescheduledMeds = useCallback(() => {
    try {
      const saved = localStorage.getItem("sabana_rescheduled_meds");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRescheduledMeds(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca jadwal tunda:", e);
    }
    return [];
  }, []);

  // Simpan daftar pengingat yang dijadwalkan ulang
  const saveRescheduledMeds = (items) => {
    setRescheduledMeds(items);
    try {
      localStorage.setItem("sabana_rescheduled_meds", JSON.stringify(items));
    } catch (e) {
      console.warn("Gagal menyimpan jadwal tunda:", e);
    }
  };

  // Cek apakah ada pengingat 15 menit yang sudah jatuh tempo atau obat yang terjadwal
  const checkForReminders = useCallback(async () => {
    if (!patientId) return;

    const currentRescheduled = loadRescheduledMeds();
    const now = Date.now();

    // 1. Cek apakah ada jadwal 15 menit yang sudah expired / jatuh tempo
    const expiredReschedule = currentRescheduled.find(
      (r) => r.patientId === patientId && now >= r.remindAt
    );

    if (expiredReschedule) {
      // Munculkan kembali sebagai PERINGATAN MENDESAK
      setActiveReminder({
        ...expiredReschedule,
        isUrgent: true,
      });
      setIsOpen(true);
      playNotificationChime(true);
      return;
    }

    // 2. Jika tidak ada jadwal tunda yang jatuh tempo dan modal belum terbuka,
    // periksa apakah ada obat aktif yang belum diminum hari ini
    if (!isOpen && !activeReminder) {
      try {
        const [medRes, logRes] = await Promise.all([
          getMedications(patientId),
          getMedicationLogs(patientId),
        ]);

        const meds = medRes.data || [];
        const logs = logRes.data || [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Cari obat aktif yang belum diminum hari ini dan tidak sedang dalam antrian reschedule
        const pendingMed = meds.find((m) => {
          const isGivenToday = logs.some(
            (l) =>
              l.medicationId === m.id &&
              l.status === "GIVEN" &&
              new Date(l.takenAt) >= todayStart
          );

          const isCurrentlySnoozed = currentRescheduled.some(
            (r) => r.medId === m.id && now < r.remindAt
          );

          return !isGivenToday && !isCurrentlySnoozed;
        });

        if (pendingMed) {
          // Jadwalkan pengingat persuasif normal
          let scheduledTime = "Waktu Terjadwal";
          try {
            const parsedTimes = typeof pendingMed.times === "string" ? JSON.parse(pendingMed.times) : pendingMed.times;
            if (Array.isArray(parsedTimes) && parsedTimes.length > 0) {
              scheduledTime = parsedTimes.join(", ");
            }
          } catch (e) {
            scheduledTime = pendingMed.times || "Waktu Terjadwal";
          }

          setActiveReminder({
            medId: pendingMed.id,
            medName: pendingMed.name,
            dosage: pendingMed.dosage,
            tabletsPerDose: pendingMed.tabletsPerDose || 1,
            notes: pendingMed.notes || "Minum sesuai anjuran resep",
            scheduledTime,
            patientId,
            patientName,
            isUrgent: false,
          });
          setIsOpen(true);
          playNotificationChime(false);
        }
      } catch (err) {
        console.warn("Gagal mengecek jadwal obat pengingat:", err);
      }
    }
  }, [patientId, patientName, isOpen, activeReminder, loadRescheduledMeds]);

  // Interval pemantauan waktu pengingat (setiap 5 detik)
  useEffect(() => {
    loadRescheduledMeds();
    checkForReminders();

    const intervalId = setInterval(() => {
      checkForReminders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [checkForReminders, loadRescheduledMeds]);

  // Efek hitung mundur visual untuk jadwal tunda yang aktif
  useEffect(() => {
    if (!activeReminder || !activeReminder.remindAt) {
      setTimeRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      const diff = activeReminder.remindAt - Date.now();
      if (diff <= 0) {
        setTimeRemaining("00:00");
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeReminder]);

  // ==================== AKSI 1: SUDAH DIMINUM (UTAMA) ====================
  const handleSudahDiminum = async () => {
    if (!activeReminder) return;

    setIsSubmitting(true);
    try {
      const response = await logMedicationAction(activeReminder.medId, {
        status: "GIVEN",
        scheduledTime: activeReminder.scheduledTime || "Waktu Sekarang",
        reason: activeReminder.isUrgent
          ? "Sudah diminum setelah pengingat mendesak 15 menit"
          : "Sudah diminum tepat waktu via pengingat notifikasi",
        recordedByName: caregiverName,
      });

      // Hapus dari daftar reschedule jika ada
      const currentRescheduled = loadRescheduledMeds();
      const updatedRescheduled = currentRescheduled.filter((r) => r.medId !== activeReminder.medId);
      saveRescheduledMeds(updatedRescheduled);

      // Sembunyikan modal dan tampilkan notifikasi toast sukses persuasif
      setIsOpen(false);
      setActiveReminder(null);

      setFeedbackToast({
        type: "success",
        title: "Dosis Berhasil Dicatat Selesai! 🎉",
        message: `Terima kasih Kak ${caregiverName}. Dosis "${activeReminder.medName}" telah diminum oleh ${patientName}. Status di database Prisma berhasil diperbarui dan progres harian pemulihan meningkat!`,
      });

      setTimeout(() => setFeedbackToast(null), 5000);

      // Beritahu parent/halaman agar progres harian pasien segera diperbarui
      if (onMedicationLogged) {
        onMedicationLogged(response);
      }
    } catch (err) {
      alert("Gagal mencatat status obat: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== AKSI 2: INGATKAN 15 MENIT LAGI (SEKUNDER) ====================
  const handleIngatkan15MenitLagi = () => {
    if (!activeReminder) return;

    // Hitung waktu persis 15 menit dari sekarang (15 * 60 * 1000 = 900.000 ms)
    const remindAt = Date.now() + 15 * 60 * 1000;

    const rescheduledItem = {
      ...activeReminder,
      remindAt,
      isUrgent: true, // Akan berstatus mendesak saat muncul kembali
      rescheduledAt: new Date().toISOString(),
    };

    const currentRescheduled = loadRescheduledMeds();
    const updatedRescheduled = [
      ...currentRescheduled.filter((r) => r.medId !== activeReminder.medId),
      rescheduledItem,
    ];

    saveRescheduledMeds(updatedRescheduled);

    // Sembunyikan notifikasi saat ini
    setIsOpen(false);
    setActiveReminder(null);

    // Toast persuasif respon penjadwalan ulang
    setFeedbackToast({
      type: "warning",
      title: "Pengingat Dijadwalkan Ulang (15 Menit) ⏰",
      message: `Kami akan memunculkan pop-up peringatan persis 15 menit lagi dengan status mendesak. Mohon segera siapkan obat "${activeReminder.medName}" agar ${patientName} meminumnya tepat waktu.`,
    });

    setTimeout(() => setFeedbackToast(null), 6000);
  };

  // Tombol simulasi cepat untuk testing percepatan 15 menit
  const handleSimulate15MinutesExpired = () => {
    if (!activeReminder) return;
    setActiveReminder((prev) => ({
      ...prev,
      isUrgent: true,
      remindAt: Date.now() - 1000,
    }));
    playNotificationChime(true);
  };

  // Trigger manual notifikasi untuk pengujian cepat jika tidak ada reminder aktif
  const triggerTestReminder = async () => {
    if (!patientId) return alert("Pilih pasien aktif terlebih dahulu.");
    try {
      const medRes = await getMedications(patientId);
      const meds = medRes.data || [];
      const firstMed = meds[0] || {
        id: "demo-med-1",
        name: "Amlodipine",
        dosage: "10 mg",
        tabletsPerDose: 1,
        notes: "Minum sesudah makan",
        times: ["Pagi"],
      };

      setActiveReminder({
        medId: firstMed.id,
        medName: firstMed.name,
        dosage: firstMed.dosage,
        tabletsPerDose: firstMed.tabletsPerDose || 1,
        notes: firstMed.notes || "Minum sesudah makan",
        scheduledTime: "Pagi (08:00 WIB)",
        patientId,
        patientName,
        isUrgent: false,
      });
      setIsOpen(true);
      playNotificationChime(false);
    } catch (e) {
      alert("Gagal memicu pengingat obat: " + e.message);
    }
  };

  return (
    <>
      {/* Toast Notifikasi Feedback Sukses / Reschedule */}
      {feedbackToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3.5 backdrop-blur-md ${
              feedbackToast.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/50 text-white"
                : "bg-amber-950/95 border-amber-500/50 text-white"
            }`}
          >
            {feedbackToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold">{feedbackToast.title}</h4>
              <p className="text-[11px] sm:text-xs text-slate-200 mt-0.5 leading-relaxed">
                {feedbackToast.message}
              </p>
            </div>
            <button
              onClick={() => setFeedbackToast(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Pengingat Obat Interaktif (Persuasif & Responsif) */}
      {isOpen && activeReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${
              activeReminder.isUrgent
                ? "bg-white border-rose-400 ring-4 ring-rose-500/20"
                : "bg-white border-emerald-300 ring-4 ring-[#153C35]/15"
            }`}
          >
            {/* Header Pengingat */}
            <div
              className={`p-5 sm:p-6 text-white relative ${
                activeReminder.isUrgent
                  ? "bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700"
                  : "bg-gradient-to-r from-[#153C35] via-[#1a4a41] to-[#0c2420]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md">
                  {activeReminder.isUrgent ? (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span className="text-amber-200">⚠️ PERINGATAN MENDESAK</span>
                    </>
                  ) : (
                    <>
                      <Pill className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-emerald-200">Jadwal Minum Obat Pasien</span>
                    </>
                  )}
                </div>

                {/* Tombol Percepat 15 Menit Khusus Simulasi Testing */}
                {!activeReminder.isUrgent && (
                  <button
                    onClick={handleSimulate15MinutesExpired}
                    title="Simulasikan waktu tunda 15 menit habis untuk pengujian status mendesak"
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white/90 transition-all border border-white/20"
                  >
                    Simulasi 15 Mnt Habis
                  </button>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black mt-2.5 leading-snug">
                {activeReminder.isUrgent
                  ? "Perhatian Khusus: Waktu 15 Menit Telah Habis!"
                  : "Waktunya Minum Obat untuk Pemulihan Optimal!"}
              </h2>

              <p className="text-xs sm:text-sm text-slate-100/90 mt-1.5 leading-relaxed">
                {activeReminder.isUrgent ? (
                  <>
                    Waktu pengingat sebelumnya telah lewat 15 menit. Penundaan obat lebih lama berisiko menurunkan efektivitas farmakoterapi dan memicu lonjakan keluhan medis pada <strong>{patientName}</strong>. Mohon segera dampingi beliau meminum obat sekarang!
                  </>
                ) : (
                  <>
                    Halo Kak <strong>{caregiverName}</strong>, demi menjaga kestabilan kondisi fisik dan mempercepat proses kesembuhan <strong>{patientName}</strong>, mari dampingi beliau meminum obat tepat waktu.
                  </>
                )}
              </p>
            </div>

            {/* Kotak Rincian Obat yang Harus Diminum */}
            <div className="p-5 sm:p-6 space-y-4">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-4 ${
                  activeReminder.isUrgent
                    ? "bg-rose-50/70 border-rose-200"
                    : "bg-[#F8FAF9] border-emerald-100"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    activeReminder.isUrgent
                      ? "bg-rose-600 text-white"
                      : "bg-[#153C35] text-white"
                  }`}
                >
                  <Pill className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {activeReminder.medName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                      {activeReminder.dosage}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Jadwal: <strong>{activeReminder.scheduledTime}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dosis: <strong>{activeReminder.tabletsPerDose || 1} Tablet</strong></span>
                    </div>
                  </div>

                  {activeReminder.notes && (
                    <div className="mt-2 text-xs font-medium text-slate-600 bg-white/80 p-2 rounded-xl border border-slate-200/60">
                      💡 <em>{activeReminder.notes}</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Peringatan Persuasif Berdasarkan Urgensi */}
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                  activeReminder.isUrgent
                    ? "bg-amber-50 text-amber-900 border border-amber-200 font-semibold"
                    : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                }`}
              >
                {activeReminder.isUrgent ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  {activeReminder.isUrgent
                    ? "Status Mendesak: Menunda kembali dapat membahayakan kestabilan pasien. Sangat disarankan untuk langsung mendampingi pasien meminum obat sekarang."
                    : "Kepatuhan tepat waktu terbukti mempercepat pemulihan mandiri pasien pasca keluar rumah sakit."}
                </span>
              </div>

              {/* Pilihan Tombol Aksi Sesuai Spesifikasi */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {/* 1. Tombol Utama: SUDAH DIMINUM */}
                <button
                  type="button"
                  onClick={handleSudahDiminum}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl font-black text-sm text-white bg-[#153C35] hover:bg-[#0c2420] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{isSubmitting ? "Menyimpan Status..." : "Sudah Diminum"}</span>
                </button>

                {/* 2. Tombol Sekunder: INGATKAN 15 MENIT LAGI (Tanpa kata 'Tunda') */}
                <button
                  type="button"
                  onClick={handleIngatkan15MenitLagi}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Sembunyikan pop-up saat ini dan jadwalkan ulang peringatan mendesak persis 15 menit lagi"
                >
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Ingatkan 15 Menit Lagi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicationReminderNotification;

