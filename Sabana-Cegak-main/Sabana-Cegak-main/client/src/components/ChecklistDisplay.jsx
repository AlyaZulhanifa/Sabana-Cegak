import React, { useState } from "react";
import {
  Stethoscope,
  Pill,
  Calendar,
  CheckSquare,
  Square,
  AlertTriangle,
  Sun,
  Sunset,
  Moon,
  Clock,
  Printer,
  RotateCcw,
  ShieldAlert,
  ClipboardList,
  Utensils,
  Bandage,
  Heart,
  Share2,
} from "lucide-react";
import AlertBadge from "./AlertBadge";

export const ChecklistDisplay = ({ data, onReset, meta }) => {
  if (!data) return null;

  const {
    diagnosis_utama = "Tidak Tercantum",
    daftar_obat = [],
    instruksi_perawatan_rumah = [],
    tanggal_kontrol = "Tidak Ditemukan",
    ai_care_alerts = [],
  } = data;

  // State untuk interaktivitas checklist perawatan harian
  const [completedTasks, setCompletedTasks] = useState({});
  // State untuk interaktivitas ceklis minum obat
  const [takenMedicines, setTakenMedicines] = useState({});
  // Filter waktu minum obat
  const [filterWaktu, setFilterWaktu] = useState("Semua");

  const toggleTask = (index) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleMedicine = (index) => {
    setTakenMedicines((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalTasks = instruksi_perawatan_rumah.length;
  const completedTaskCount =
    Object.values(completedTasks).filter(Boolean).length;
  const taskProgressPercent =
    totalTasks > 0 ? Math.round((completedTaskCount / totalTasks) * 100) : 0;

  // Filter daftar obat berdasarkan waktu minum
  const filteredObat = daftar_obat.filter((obat) => {
    if (filterWaktu === "Semua") return true;
    return obat.waktu_minum
      ?.toLowerCase()
      .includes(filterWaktu.toLowerCase());
  });

  const getWaktuIcon = (waktu = "") => {
    const w = waktu.toLowerCase();
    if (w.includes("pagi")) return <Sun className="w-4 h-4 text-amber-500" />;
    if (w.includes("siang")) return <Sunset className="w-4 h-4 text-orange-500" />;
    if (w.includes("malam")) return <Moon className="w-4 h-4 text-indigo-500" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const getCategoryIcon = (category = "") => {
    const c = category.toLowerCase();
    if (c.includes("luka")) return <Bandage className="w-4 h-4 text-rose-500" />;
    if (c.includes("nutrisi") || c.includes("makan"))
      return <Utensils className="w-4 h-4 text-emerald-500" />;
    return <Heart className="w-4 h-4 text-hospital-500" />;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Hasil Ekstraksi Dokumen Medis
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Dianalisis secara aman oleh SABANA CEGAK Engine {meta?.processingTimeSeconds ? `(${meta.processingTimeSeconds} detik)` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Panduan</span>
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Unggah Ulang</span>
          </button>
        </div>
      </div>

      {/* Safety Audit & AI Care Alerts */}
      {ai_care_alerts && ai_care_alerts.length > 0 && (
        <section className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              AI Care & Safety Audit Alerts
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {ai_care_alerts.length} Peringatan Keselamatan
            </span>
          </div>
          <AlertBadge alerts={ai_care_alerts} />
        </section>
      )}

      {/* Diagnosis Utama & Jadwal Kontrol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Diagnosis Utama Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-brand-600 to-teal-800 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
            <Stethoscope className="w-48 h-48" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Stethoscope className="w-4 h-4" />
              <span>Diagnosis Utama Pasien</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {diagnosis_utama}
            </h2>
            <p className="text-sm text-emerald-100/90 mt-3 max-w-xl font-normal leading-relaxed">
              Panduan perawatan terpersonalisasi di bawah ini disusun khusus untuk mendukung proses pemulihan pasien secara aman di rumah.
            </p>
          </div>
        </div>

        {/* Tanggal Kontrol Ulang Card */}
        <div
          className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${
            tanggal_kontrol === "Tidak Ditemukan"
              ? "bg-amber-50/70 border-amber-200 text-amber-950"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                Jadwal Kontrol RS
              </span>
              {tanggal_kontrol !== "Tidak Ditemukan" && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800">
                  Tercatat
                </span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {tanggal_kontrol}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              {tanggal_kontrol === "Tidak Ditemukan"
                ? "Dokumen tidak mencantumkan tanggal kontrol kembali. Segera konfirmasi ke bagian administrasi RS."
                : "Bawa lembar resume medis dan kartu identitas saat melakukan kunjungan kontrol."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Prioritas Pemulihan Pasca Rawat
            </span>
          </div>
        </div>
      </div>

      {/* Daftar Obat & Jadwal Minum */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-brand-600" />
              Daftar Obat & Jadwal Minum
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ceklis obat setelah diberikan kepada pasien untuk mencegah dosis terlewat
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            {["Semua", "Pagi", "Siang", "Malam"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setFilterWaktu(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterWaktu === filter
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {daftar_obat.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Tidak ada data obat yang ditemukan pada dokumen ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredObat.map((obat, idx) => {
              const isTaken = !!takenMedicines[idx];

              return (
                <div
                  key={idx}
                  onClick={() => toggleMedicine(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isTaken
                      ? "bg-emerald-50/60 border-emerald-300"
                      : "bg-slate-50/70 border-slate-200 hover:border-brand-300 hover:bg-brand-50/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-brand-600 focus:outline-none"
                    >
                      {isTaken ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-base font-bold truncate ${
                            isTaken
                              ? "text-slate-500 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {obat.nama_obat}
                        </h4>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {getWaktuIcon(obat.waktu_minum)}
                          <span>{obat.waktu_minum}</span>
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          Dosis: {obat.dosis}
                        </span>
                      </div>

                      {obat.catatan && (
                        <p className="text-xs text-slate-600 mt-2 font-medium bg-white/70 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700">Catatan:</span> {obat.catatan}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Checklist Instruksi Perawatan Rumah (Luka / Nutrisi / Aktivitas) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-600" />
              Checklist Instruksi Perawatan Mandiri di Rumah
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Panduan harian pendamping untuk merawat luka, nutrisi makanan, dan batasan aktivitas
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="sm:text-right">
            <span className="text-xs font-bold text-slate-700">
              Progres Hari Ini: {completedTaskCount}/{totalTasks} ({taskProgressPercent}%)
            </span>
            <div className="w-36 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {instruksi_perawatan_rumah.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Tidak ada instruksi khusus perawatan rumah yang terdeteksi.
          </div>
        ) : (
          <div className="space-y-3">
            {instruksi_perawatan_rumah.map((instruksi, idx) => {
              const isDone = !!completedTasks[idx];

              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isDone
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-slate-50/60 border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-brand-600 focus:outline-none"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-white border border-slate-200 text-slate-700">
                          {getCategoryIcon(instruksi.kategori)}
                          <span>{instruksi.kategori}</span>
                        </span>
                      </div>
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isDone
                            ? "text-slate-400 line-through"
                            : "text-slate-800 font-medium"
                        }`}
                      >
                        {instruksi.tindakan}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ChecklistDisplay;

