import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";
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
  Trash2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  getCareChecklists,
  createCareChecklist,
  completeCareChecklist,
  deleteCareChecklist,
} from "../services/api";

export const CareChecklistPage = ({ activePatient }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showModal, setShowModal] = useState(null);
  const [reason, setReason] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Perawatan Luka");
  const [newDescription, setNewDescription] = useState("");
  const [newFrequency, setNewFrequency] = useState("Setiap Hari");
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const getFullTitle = (item) => {
    if (!item) return "";
    if (
      item.title?.endsWith("...") &&
      item.description &&
      item.description.toLowerCase().startsWith(item.title.slice(0, -3).trim().toLowerCase())
    ) {
      return item.description;
    }
    return item.title || "";
  };

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
      setChecklists([]);
      return;
    }

    try {
      const res = await getCareChecklists(patientId);
      const list = res.data || [];
      setChecklists(list);
      const map = {};
      list.forEach((item) => {
        if (item.isCompletedToday) {
          map[item.id] = "COMPLETED";
        }
      });
      setCompletedMap((prev) => ({ ...map, ...prev }));
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

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      return alert("Nama aktivitas instruksi wajib diisi!");
    }

    try {
      await createCareChecklist({
        patientId,
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        frequency: newFrequency,
      });

      setShowAddModal(false);
      setNewTitle("");
      setNewDescription("");
      loadData();
    } catch (err) {
      alert("Gagal menambahkan checklist: " + err.message);
    }
  };

  const handleDeleteChecklist = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus instruksi "${title}"?`)) {
      return;
    }

    try {
      await deleteCareChecklist(id);
      loadData();
    } catch (err) {
      alert("Gagal menghapus instruksi: " + err.message);
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-[#153C35]" />
            Daily Home Care Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Panduan harian perawatan mandiri di rumah (perawatan luka, nutrisi, dan aktivitas) sesuai petunjuk RS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Progress Tracker Widget */}
          <div className="bg-[#E8F2ED] border border-emerald-200 p-3.5 rounded-2xl min-w-[190px]">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#153C35]">
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

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Instruksi</span>
          </button>
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
            const fullTitle = getFullTitle(item);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedDetailItem(item)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-300"
                    : "bg-white border-slate-200 hover:border-[#153C35]/50 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2ED] text-[#153C35]">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.frequency || "Setiap Hari"}
                        </span>
                      </div>

                      <h3
                        title={fullTitle}
                        className={`text-sm sm:text-base font-bold truncate ${
                          isDone ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {fullTitle}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div
                    className="flex items-center gap-2 self-end sm:self-center shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChecklist(item.id, item.title);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus checklist ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Selesai Dilakukan</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(item);
                            setReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
                        >
                          Lewati
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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

      {/* Modal Tambah Instruksi Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Instruksi Perawatan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tambahkan tugas harian untuk merawat pasien pasca pulang dari rumah sakit.
            </p>

            <form onSubmit={handleCreateChecklist} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Instruksi / Tindakan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bersihkan perban operasi dengan larutan NaCl"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  >
                    <option>Perawatan Luka</option>
                    <option>Nutrisi</option>
                    <option>Aktivitas</option>
                    <option>Pemeriksaan Tanda Vital</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frekuensi</label>
                  <input
                    type="text"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    placeholder="Contoh: Setiap Hari / Tiap 2 Hari"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detail Petunjuk Khusus</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Gunakan sarung tangan steril, jangan biarkan kasa basah"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  Simpan Instruksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Konfirmasi Aktivitas: {getFullTitle(showModal)}
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

      {/* Modal Detail Item Instruksi */}
      {selectedDetailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedDetailItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  {getCategoryIcon(selectedDetailItem.category)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2ED] text-[#153C35]">
                      {selectedDetailItem.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {selectedDetailItem.frequency || "Setiap Hari"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                    Detail Instruksi Perawatan Pasien
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Judul Lengkap (Tanpa truncate / line-clamp) */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Aktivitas / Tindakan
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">
                {getFullTitle(selectedDetailItem)}
              </h2>
            </div>

            {/* Status Hari Ini */}
            <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Status Hari Ini:</span>
              {completedMap[selectedDetailItem.id] === "COMPLETED" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Selesai Dilakukan
                </span>
              ) : completedMap[selectedDetailItem.id] === "SKIPPED" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Dilewati Hari Ini
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Belum Dikerjakan
                </span>
              )}
            </div>

            {/* Deskripsi & Panduan Perawatan Secara Utuh */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Deskripsi & Panduan Perawatan
              </span>
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                {selectedDetailItem.description || selectedDetailItem.title || "Tidak ada rincian deskripsi tambahan."}
              </div>
            </div>

            {/* Footer Modal / Aksi */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>

              {completedMap[selectedDetailItem.id] !== "COMPLETED" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedDetailItem;
                      setSelectedDetailItem(null);
                      setShowModal(item);
                      setReason("");
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Lewati
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedDetailItem;
                      setSelectedDetailItem(null);
                      setShowModal(item);
                      setReason("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] shadow-xs"
                  >
                    Tandai Selesai
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareChecklistPage;
