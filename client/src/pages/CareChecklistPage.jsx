import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Bandage,
  Utensils,
  Activity,
  Plus,
  History,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { getCareChecklists, completeCareChecklist } from "../services/api";

export const CareChecklistPage = ({ activePatient }) => {
  const [checklists, setChecklists] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showModal, setShowModal] = useState(null);
  const [reason, setReason] = useState("");
  const [caregiverName, setCaregiverName] = useState(activePatient?.primaryCaregiver || "Siti Rahma");

  const patientId = activePatient?.id || "patient-demo-1";

  const loadData = async () => {
    try {
      const res = await getCareChecklists(patientId);
      setChecklists(res.data || []);
    } catch (e) {
      console.error("Gagal memuat checklist:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleAction = async (status) => {
    if (!showModal) return;

    try {
      await completeCareChecklist(showModal.id, {
        status,
        reason,
        recordedByName: caregiverName,
      });

      setCompletedMap((prev) => ({
        ...prev,
        [showModal.id]: status,
      }));

      setShowModal(null);
      setReason("");
    } catch (e) {
      alert("Gagal mencatat checklist: " + e.message);
    }
  };

  const getCategoryIcon = (category = "") => {
    const c = category.toLowerCase();
    if (c.includes("luka")) return <Bandage className="w-4 h-4 text-rose-500" />;
    if (c.includes("nutrisi") || c.includes("makan")) return <Utensils className="w-4 h-4 text-emerald-600" />;
    return <Activity className="w-4 h-4 text-[#153C35]" />;
  };

  const filtered = checklists.filter((item) => {
    if (activeCategory === "Semua") return true;
    return item.category?.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const total = checklists.length;
  const completedCount = Object.values(completedMap).filter((s) => s === "COMPLETED").length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-[#153C35]" />
            Daily Home Care Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Panduan harian perawatan mandiri di rumah (perawatan luka, nutrisi, dan aktivitas) sesuai petunjuk RS.
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div className="bg-[#E8F2ED] border border-emerald-200 p-3.5 rounded-2xl sm:text-right min-w-[200px]">
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-[#153C35]">
            <span>Progres Hari Ini:</span>
            <span>{completedCount}/{total} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-white rounded-full h-2 mt-2 overflow-hidden border border-emerald-200">
            <div
              className="bg-[#153C35] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["Semua", "Perawatan Luka", "Nutrisi", "Aktivitas"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-[#153C35] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Tidak ada aktivitas checklist dalam kategori ini.
          </div>
        ) : (
          filtered.map((item) => {
            const status = completedMap[item.id] || "PENDING";
            const isDone = status === "COMPLETED";

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-300"
                    : "bg-white border-slate-200 hover:border-[#153C35]/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2ED] text-[#153C35]">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.frequency || "Setiap Hari"}
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isDone ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Selesai Dilakukan</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowModal(item);
                            setReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
                        >
                          Lewati
                        </button>
                        <button
                          onClick={() => {
                            setShowModal(item);
                            setReason("");
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] shadow-xs"
                        >
                          Tandai Selesai
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Konfirmasi Aktivitas: {showModal.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih apakah instruksi perawatan ini telah selesai dijalankan atau dilewati dengan alasan.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pendamping</label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Alasan (Bila dilewati)</label>
                <input
                  type="text"
                  placeholder="Misal: Perban masih sangat bersih, diganti besok pagi"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleAction("SKIPPED")}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200"
                >
                  Lewati Hari Ini
                </button>
                <button
                  onClick={() => handleAction("COMPLETED")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420]"
                >
                  Sudah Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareChecklistPage;

