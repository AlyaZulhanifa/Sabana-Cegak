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
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "2 kali sehari",
    times: ["Pagi", "Malam"],
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
        frequency: formData.frequency,
        times: formData.times,
        notes: formData.notes,
      });

      setShowAddModal(false);
      setFormData({
        name: "",
        dosage: "",
        frequency: "2 kali sehari",
        times: ["Pagi", "Malam"],
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

  const filteredMeds = medications.filter((m) => {
    if (activeFilter === "Semua") return true;
    const times = parseTimes(m.times);
    return times.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-[#153C35]" />
            Smart Medication Reminder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau dan catat jadwal pemberian obat pasien agar tidak ada dosis yang terlewat atau dobel.
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

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#153C35]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {med.name}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E8F2ED] text-[#153C35]">
                        Dosis: {med.dosage}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {times.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {med.notes && (
                    <p className="text-xs text-slate-600 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                      <span className="font-semibold text-slate-700">Aturan Pakai:</span> {med.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {med.frequency || "Teratur"}
                    </span>
                    <button
                      onClick={() => handleDeleteMedication(med.id, med.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus resep obat ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowLogModal(med);
                      setLogStatus("GIVEN");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Resep Obat Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan informasi resep obat pasien untuk menambahkan ke jadwal pengingat.
            </p>

            <form onSubmit={handleCreateMedication} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Obat & Sediaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Amlodipine 5mg / Amoxicillin 500mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosis Sekali Minum *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1 Tablet"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frekuensi</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2 kali sehari"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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
                  placeholder="Misal: Minum sesudah makan, wajib dihabiskan"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
              Konfirmasi status pemberian obat kepada pasien.
            </p>

            <div className="space-y-4">
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
                          ? "bg-[#153C35] text-white border-[#153C35]"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

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
