import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";
import {
  History,
  Pill,
  ClipboardCheck,
  MessageSquare,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import { getCareHistory, createCareNote } from "../services/api";

export const HistoryPage = ({ activePatient }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [filterType, setFilterType] = useState("Semua");
  const [newNote, setNewNote] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("Perkembangan Harian");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser().then(res => setCurrentUser(res?.user)).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser?.name) setAuthorName(currentUser.name);
    if (activePatient?.primaryCaregiver) setAuthorName(activePatient.primaryCaregiver);
  }, [currentUser, activePatient]);

  const patientId = activePatient?.id;

  const loadHistory = async () => {
    if (!patientId) {
      setHistory([]);
      return;
    }

    try {
      const res = await getCareHistory(patientId);
      setHistory(res.data || []);
    } catch (e) {
      console.error("Gagal memuat riwayat:", e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await createCareNote({
        patientId,
        authorName,
        category,
        content: newNote.trim(),
      });
      setNewNote("");
      loadHistory();
    } catch (err) {
      alert("Gagal menambahkan catatan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = history.filter((item) => {
    if (filterType === "Semua") return true;
    if (filterType === "Obat") return item.type === "MEDICATION";
    if (filterType === "Checklist") return item.type === "CHECKLIST";
    if (filterType === "Catatan") return item.type === "NOTE";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#153C35]" />
            Family Care Monitoring & Linimasa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekam jejak terpadu pemberian obat, aktivitas perawatan, dan koordinasi antar anggota keluarga pendamping.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {["Semua", "Obat", "Checklist", "Catatan"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === f
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Input Catatan Koordinasi Keluarga */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#153C35] mb-3 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" />
          <span>Tulis Catatan Perkembangan Pasien / Operan Jaga Keluarga</span>
        </h3>

        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Misal: Pasien sudah makan 1 mangkuk bubur, suhu tubuh 36.8°C normal. Dilanjutkan giliran jaga adik sore nanti..."
            className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#153C35]/20 focus:border-[#153C35]"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Nama Anda"
                className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 w-36 bg-slate-50"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50 text-slate-700"
              >
                <option>Perkembangan Harian</option>
                <option>Keluhan Pasien</option>
                <option>Operan Giliran Jaga</option>
                <option>Konsultasi Dokter</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newNote.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#153C35] hover:bg-[#0c2420] transition-colors disabled:opacity-50 self-end sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Catatan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Timeline Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>Linimasa Aktivitas Perawatan</span>
          <span className="text-xs text-slate-400 font-normal">({filtered.length} riwayat tercatat)</span>
        </h3>

        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Belum ada riwayat aktivitas dalam kategori ini.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map((item, idx) => {
              const isMed = item.type === "MEDICATION";
              const isChk = item.type === "CHECKLIST";
              const isNote = item.type === "NOTE";

              return (
                <div key={idx} className="relative group">
                  {/* Dot Icon on line */}
                  <span
                    className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs ${
                      isMed
                        ? "bg-[#153C35]"
                        : isChk
                        ? "bg-emerald-600"
                        : "bg-hospital-600"
                    }`}
                  >
                    {isMed ? (
                      <Pill className="w-2.5 h-2.5" />
                    ) : isChk ? (
                      <ClipboardCheck className="w-2.5 h-2.5" />
                    ) : (
                      <MessageSquare className="w-2.5 h-2.5" />
                    )}
                  </span>

                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.subtitle}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Dicatat oleh: <strong>{item.author}</strong></span>
                      {item.status && (
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            item.status === "GIVEN" || item.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

