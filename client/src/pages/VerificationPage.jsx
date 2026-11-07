import React, { useState } from "react";
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
} from "lucide-react";
import { verifyCarePlan } from "../services/api";

export const VerificationPage = ({
  rawAiData,
  analysisId,
  activePatient,
  onVerificationComplete,
  onCancel,
}) => {
  const [data, setData] = useState(rawAiData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    diagnosis_utama = { value: "", source: "Ringkasan Medis", confidence: "high" },
    daftar_obat = [],
    instruksi_perawatan_rumah = [],
    tanggal_kontrol = { tanggal: null, waktu: null, poli: null, lokasi: null },
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

  const handleCareChange = (index, value) => {
    setData((prev) => {
      const updated = [...prev.instruksi_perawatan_rumah];
      updated[index] = { ...updated[index], tindakan: value };
      return { ...prev, instruksi_perawatan_rumah: updated };
    });
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
        patientId: activePatient?.id || "patient-demo-1",
        analysisId,
        verifiedData: data,
        caregiverName: activePatient?.primaryCaregiver || "Siti Rahma",
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
              Periksa & Konfirmasi Hasil Ekstraksi Dokumen Medis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Demi keselamatan pasien, AI tidak langsung mengaktifkan jadwal obat secara otomatis. Periksa kecocokan data dengan dokumen fisik rumah sakit, perbaiki bila ada koreksi, lalu tekan tombol konfirmasi.
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
          <span>1. Diagnosis Utama (Dapat Diedit Sesuai Resume RS)</span>
        </div>
        <input
          type="text"
          value={diagnosis_utama?.value || ""}
          onChange={(e) => handleDiagnosisChange(e.target.value)}
          placeholder="Nama diagnosis medis utama..."
          className="w-full text-base sm:text-lg font-bold text-slate-900 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#153C35]/20 focus:border-[#153C35]"
        />
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Sumber: {diagnosis_utama?.source || "Dokumen RS"} • Tingkat Keyakinan AI: {diagnosis_utama?.confidence || "Tinggi"}
        </p>
      </div>

      {/* Section 2: Daftar Obat & Jadwal Minum */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>2. Verifikasi Resep Obat & Aturan Minum</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{daftar_obat.length} Obat Terdeteksi</span>
        </div>

        <div className="space-y-4">
          {daftar_obat.map((obat, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Obat</label>
                  <input
                    type="text"
                    value={obat.nama_obat || ""}
                    onChange={(e) => handleMedicationChange(idx, "nama_obat", e.target.value)}
                    className="w-full text-xs font-bold rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosis</label>
                  <input
                    type="text"
                    value={obat.dosis || ""}
                    onChange={(e) => handleMedicationChange(idx, "dosis", e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Frekuensi</label>
                  <input
                    type="text"
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
                  placeholder="Misal: Minum sesudah makan"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Instruksi Perawatan Rumah */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] uppercase tracking-wider mb-4">
          <ClipboardList className="w-4 h-4" />
          <span>3. Verifikasi Checklist Perawatan di Rumah</span>
        </div>

        <div className="space-y-3">
          {instruksi_perawatan_rumah.map((instruksi, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F2ED] text-[#153C35]">
                {instruksi.kategori || "Lainnya"}
              </span>
              <textarea
                rows={2}
                value={instruksi.tindakan || ""}
                onChange={(e) => handleCareChange(idx, e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
              />
            </div>
          ))}
        </div>
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
              placeholder="Contoh: Poli Penyakit Dalam"
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

