import React, { useState, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  FileCheck2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  File,
  Download,
  PenTool,
  ExternalLink,
  Pill,
  ClipboardList,
  CheckCircle2,
  Bell,
  History,
} from "lucide-react";
import {
  uploadMedicalDocument,
  getPatientDocuments,
  startManualCarePlan,
  getDocumentFileUrl,
} from "../services/api";

export const DocumentsPage = ({ activePatient, onOpenVerification, onNavigate }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isStartingManual, setIsStartingManual] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const patientId = activePatient?.id;

  const loadDocuments = async () => {
    try {
      const res = await getPatientDocuments(patientId || "");
      setDocuments(res.data || []);
    } catch (e) {
      console.error("Gagal memuat dokumen:", e);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg("");
    setUploadSuccess(null);
    setUploadProgress(20);

    try {
      const res = await uploadMedicalDocument(selectedFile, patientId, (percent) => {
        setUploadProgress(Math.min(90, Math.max(20, percent)));
      });

      setUploadProgress(100);
      setSelectedFile(null);
      loadDocuments();

      setUploadSuccess({
        message: res.message || "Dokumen berhasil diekstrak dengan Gemini AI!",
        counts: res.counts || {
          medications: res.data?.daftar_obat?.length || 0,
          checklists: (res.data?.checklist_perawatan || res.data?.instruksi_perawatan_rumah)?.length || 0,
          alerts: res.data?.ai_care_alerts?.length || 0,
        },
        data: res.data,
        analysisId: res.meta?.analysisId,
        patientName: res.patient?.name || activePatient?.name || "Ibu Jusmanidar",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal mengunggah dan menganalisis berkas dokumen medis.";
      setErrorMsg(msg);
      loadDocuments();
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartManual = async () => {
    setIsStartingManual(true);
    try {
      const res = await startManualCarePlan({
        patientId,
        diagnosis: "Pasca Rawat Inap",
      });

      if (res.data && onOpenVerification) {
        onOpenVerification(res.data, res.meta?.analysisId);
      }
    } catch (err) {
      alert("Gagal memulai entri manual: " + err.message);
    } finally {
      setIsStartingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#153C35]" />
            Dokumen Medis Pasien
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Unggah resume medis keluar RS (Discharge Summary), resep dokter, atau berkas kontrol. Gemini AI akan mengekstrak jadwal obat, panduan checklist perawatan, dan deteksi peringatan risiko komplikasi secara otomatis.
          </p>
        </div>

        <button
          onClick={handleStartManual}
          disabled={isStartingManual}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#153C35] bg-[#E8F2ED] hover:bg-[#d6e9e0] border border-emerald-200 transition-colors shadow-2xs self-start md:self-center shrink-0"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Input Rencana Perawatan Manual</span>
        </button>
      </div>

      {/* Success Notification & Quick Navigator */}
      {uploadSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950">
                {uploadSuccess.message}
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Data hasil analisis berkas medis telah tersimpan secara nyata ke database pasien{" "}
                <strong>{uploadSuccess.patientName}</strong> dan otomatis memperbarui seluruh menu aplikasi:
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#E8F2ED] text-[#153C35] rounded-lg">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Jadwal Obat</span>
                  <span className="text-sm font-black text-slate-800">
                    {uploadSuccess.counts.medications} Obat Aktif
                  </span>
                </div>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("medications")}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#153C35] text-white hover:bg-[#0c2420]"
                >
                  Buka
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Checklist Panduan</span>
                  <span className="text-sm font-black text-slate-800">
                    {uploadSuccess.counts.checklists} Tugas
                  </span>
                </div>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("checklists")}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#153C35] text-white hover:bg-[#0c2420]"
                >
                  Buka
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Care Alerts</span>
                  <span className="text-sm font-black text-slate-800">
                    {uploadSuccess.counts.alerts} Peringatan
                  </span>
                </div>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("alerts")}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#153C35] text-white hover:bg-[#0c2420]"
                >
                  Buka
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-200/60 text-xs">
            <span className="text-emerald-800 font-medium">
              Linimasa riwayat juga otomatis mencatat log ekstraksi dokumen ini.
            </span>
            <div className="flex items-center gap-2">
              {onNavigate && (
                <button
                  onClick={() => onNavigate("history")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white font-bold text-[#153C35] hover:bg-emerald-50"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Lihat Riwayat Perawatan</span>
                </button>
              )}
              {onOpenVerification && (
                <button
                  onClick={() => onOpenVerification(uploadSuccess.data, uploadSuccess.analysisId)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#153C35] font-bold text-white hover:bg-[#0c2420]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tinjau Lembar Verifikasi Lengkap</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#153C35] mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          <span>Unggah Berkas Baru (PDF / JPG / PNG Max 15 MB)</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-[#153C35] rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 cursor-pointer transition-colors">
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              className="hidden"
              id="file-doc-input"
            />
            <label htmlFor="file-doc-input" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2ED] text-[#153C35] flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {selectedFile
                  ? selectedFile.name
                  : "Klik untuk memilih dokumen medis atau seret berkas ke sini"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Siap diunggah dan dianalisis`
                  : "Mendukung format PDF, JPG, PNG"}
              </p>
            </label>
          </div>

          {errorMsg && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartManual}
                  className="px-3 py-1.5 rounded-lg bg-[#153C35] text-white text-xs font-bold hover:bg-[#0c2420]"
                >
                  Gunakan Input Rencana Mandiri Sekarang
                </button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#153C35]" />
                  Mengekstrak Dokumen Medis dengan Gemini AI Multimodal...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#153C35] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#153C35] hover:bg-[#0c2420] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Unggah & Ekstrak dengan Gemini AI</span>
          </button>
        </form>
      </div>

      {/* Uploaded Documents History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-[#153C35]" />
          Daftar Dokumen yang Telah Diunggah
        </h3>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Belum ada dokumen yang diunggah untuk pasien ini.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#153C35] shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{doc.fileName}</span>
                    <span className="text-[11px] text-slate-500">
                      {(doc.fileSize / 1024).toFixed(1)} KB • Diunggah pada{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {doc.status}
                  </span>

                  {doc.diskFileName && (
                    <a
                      href={getDocumentFileUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-[#153C35] font-semibold text-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Berkas</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
