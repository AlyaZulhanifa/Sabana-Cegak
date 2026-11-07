import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Pill,
  ClipboardList,
  Calendar,
  Stethoscope,
  ArrowRight,
  Info,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import { verifyCarePlan } from "../services/api";

export const VerificationPage = ({
  rawAiData,
  analysisId,
  activePatient,
  onVerificationComplete,
  onCancel,
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(rawAiData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getCurrentUser().then(res => setCurrentUser(res?.user)).catch(() => {});
  }, []);

  const {
    diagnosis_utama = { value: "", source: "Ringkasan Medis", confidence: "Tinggi" },
    daftar_obat = [],
    instruksi_perawatan_rumah = [],
    tanggal_kontrol = { tanggal: "", waktu: "09:00 WIB", poli: "", lokasi: "" },
    ai_care_alerts = [],
  } = data;

  const handleDiagnosisChange = (newVal) => {
    setData((prev) => ({
      ...prev,
      diagnosis_utama: { ...prev.diagnosis_utama, value: newVal },
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setData((prev) => {
      const updated = [...prev.daftar_obat];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, daftar_obat: updated };
    });
  };

  const handleAddMedication = () => {
    setData((prev) => ({
      ...prev,
      daftar_obat: [
        ...(prev.daftar_obat || []),
        {
          nama_obat: "",
          dosis: "1 Tablet",
          frekuensi: "2 kali sehari",
          waktu_minum: ["Pagi", "Malam"],
          catatan: "Minum sesudah makan",
        },
      ],
    }));
  };

  const handleRemoveMedication = (index) => {
    setData((prev) => ({
      ...prev,
      daftar_obat: prev.daftar_obat.filter((_, idx) => idx !== index),
    }));
  };

  const handleCareChange = (index, value) => {
    setData((prev) => {
      const updated = [...prev.instruksi_perawatan_rumah];
      updated[index] = { ...updated[index], tindakan: value };
      return { ...prev, instruksi_perawatan_rumah: updated };
    });
  };

  const handleAddCare = () => {
    setData((prev) => ({
      ...prev,
      instruksi_perawatan_rumah: [
        ...(prev.instruksi_perawatan_rumah || []),
        {
          kategori: "Perawatan Luka",
          tindakan: "",
        },
      ],
    }));
  };

  const handleRemoveCare = (index) => {
    setData((prev) => ({
      ...prev,
      instruksi_perawatan_rumah: prev.instruksi_perawatan_rumah.filter((_, idx) => idx !== index),
    }));
  };

  const handleAppointmentChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      tanggal_kontrol: { ...prev.tanggal_kontrol, [field]: value },
    }));
  };

  const handleConfirmAndActivate = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await verifyCarePlan({
        patientId: activePatient?.id,
        analysisId,
        verifiedData: data,
        caregiverName: activePatient?.primaryCaregiver || currentUser?.name || "Caregiver",
      });

      setSuccessMsg("Rencana perawatan berhasil diverifikasi dan diaktifkan ke jadwal pasien!");
      setTimeout(() => {
        if (onVerificationComplete) onVerificationComplete();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Gagal mengaktifkan rencana perawatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-[#153C35] border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tahap Verifikasi Keluarga (Patient Safety Step)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Periksa & Konfirmasi Rencana Perawatan Pasien
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Demi keselamatan pasien, periksa kembali daftar obat, instruksi luka/nutrisi, dan tanggal kontrol sebelum diaktifkan ke dasbor. Anda dapat menambah, mengedit, atau menghapus item di bawah ini.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batalkan
            </button>
          </div>
        </div>
      </div>

      {/* AI Care Alerts Review */}
      {ai_care_alerts && ai_care_alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-950">
              Peringatan AI Care & Audit Keselamatan
            </h3>
          </div>
          <div className="space-y-2">
            {ai_care_alerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-white/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${alert.level === 'danger' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                  {alert.kategori || alert.level}
                </span>
                <span className="font-medium leading-relaxed">{alert.pesan}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Diagnosis Utama */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] uppercase tracking-wider mb-2">
          <Stethoscope className="w-4 h-4" />
          <span>1. Diagnosis Utama</span>
        </div>
        <input
          type="text"
          value={diagnosis_utama?.value || ""}
          onChange={(e) => handleDiagnosisChange(e.target.value)}
          placeholder="Contoh: Post Laparatomi / Hipertensi Primer / Pemulihan Luka Operasi"
          className="w-full text-base sm:text-lg font-bold text-slate-900 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#153C35]/20 focus:border-[#153C35]"
        />
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Sumber: {diagnosis_utama?.source || "Dokumen RS"}
        </p>
      </div>

      {/* Section 2: Daftar Obat & Jadwal Minum */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>2. Verifikasi Resep Obat & Aturan Minum</span>
          </div>
          <button
            type="button"
            onClick={handleAddMedication}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8F2ED] text-[#153C35] hover:bg-[#d6e9e0] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Obat</span>
          </button>
        </div>

        {daftar_obat.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Belum ada obat yang dimasukkan. Tekan "+ Tambah Obat" di atas.</p>
        ) : (
          <div className="space-y-4">
            {daftar_obat.map((obat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Obat #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus baris obat ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Obat</label>
                    <input
                      type="text"
                      placeholder="Misal: Amlodipine 10mg"
                      value={obat.nama_obat || ""}
                      onChange={(e) => handleMedicationChange(idx, "nama_obat", e.target.value)}
                      className="w-full text-xs font-bold rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosis Sediaan</label>
                    <input
                      type="text"
                      placeholder="Misal: 10 mg / 1 tab"
                      value={obat.dosis || ""}
                      onChange={(e) => handleMedicationChange(idx, "dosis", e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Jumlah Tablet (Dokumen)</label>
                    <input
                      type="text"
                      placeholder="Misal: 10 Tab / 20 Tab"
                      value={obat.jumlah_tablet !== undefined ? obat.jumlah_tablet : (obat.jumlah || "")}
                      onChange={(e) => handleMedicationChange(idx, "jumlah_tablet", e.target.value)}
                      className="w-full text-xs font-bold rounded-lg border border-slate-300 p-2 bg-white text-[#153C35]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Frekuensi Minum</label>
                    <input
                      type="text"
                      placeholder="Misal: 1 kali sehari"
                      value={obat.frekuensi || ""}
                      onChange={(e) => handleMedicationChange(idx, "frekuensi", e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Aturan Pakai</label>
                  <input
                    type="text"
                    value={obat.catatan || ""}
                    onChange={(e) => handleMedicationChange(idx, "catatan", e.target.value)}
                    placeholder="Misal: Wajib dihabiskan setelah makan"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Instruksi Perawatan Rumah */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>3. Verifikasi Checklist Perawatan di Rumah</span>
          </div>
          <button
            type="button"
            onClick={handleAddCare}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8F2ED] text-[#153C35] hover:bg-[#d6e9e0] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Instruksi</span>
          </button>
        </div>

        {instruksi_perawatan_rumah.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Belum ada checklist. Tekan "+ Tambah Instruksi" di atas.</p>
        ) : (
          <div className="space-y-3">
            {instruksi_perawatan_rumah.map((instruksi, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2ED] text-[#153C35]">
                    {instruksi.kategori || "Perawatan Luka"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCare(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus instruksi ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={instruksi.tindakan || ""}
                  onChange={(e) => handleCareChange(idx, e.target.value)}
                  placeholder="Misal: Jaga perban luka operasi tetap kering. Ganti kasa tiap 2 hari."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Jadwal Kontrol RS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] uppercase tracking-wider mb-4">
          <Calendar className="w-4 h-4" />
          <span>4. Verifikasi Jadwal Kontrol Kembali</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Kontrol</label>
            <input
              type="text"
              value={tanggal_kontrol?.tanggal || ""}
              onChange={(e) => handleAppointmentChange("tanggal", e.target.value)}
              placeholder="Contoh: 18 November 2026"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Poli / Dokter Spesialis</label>
            <input
              type="text"
              value={tanggal_kontrol?.poli || ""}
              onChange={(e) => handleAppointmentChange("poli", e.target.value)}
              placeholder="Contoh: Poli Bedah Digestif / Poli Penyakit Dalam"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="pt-2 pb-6">
        <button
          onClick={handleConfirmAndActivate}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-[#153C35] hover:bg-[#0c2420] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-md shadow-[#153C35]/25 cursor-pointer disabled:opacity-70"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Konfirmasi dan Buat Rencana Perawatan</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;
