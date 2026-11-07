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
} from "lucide-react";
import { uploadMedicalDocument, getPatientDocuments } from "../services/api";

export const DocumentsPage = ({ activePatient, onOpenVerification }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const patientId = activePatient?.id || "patient-demo-1";

  const loadDocuments = async () => {
    try {
      const res = await getPatientDocuments(patientId);
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
    setUploadProgress(20);

    try {
      const res = await uploadMedicalDocument(selectedFile, patientId, (percent) => {
        setUploadProgress(Math.min(85, Math.max(20, percent)));
      });

      setUploadProgress(100);
      setSelectedFile(null);
      loadDocuments();

      // Jika berhasil diekstrak oleh Gemini, arahkan ke tahap verifikasi keluarga
      if (res.data && onOpenVerification) {
        onOpenVerification(res.data, res.meta?.analysisId);
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal mengunggah dan menganalisis berkas.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-[#153C35]" />
          Arsip Dokumen Medis Pasien
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Unggah ringkasan medis pulang (Discharge Summary), resep tulisan tangan dokter, atau lembar instruksi perawatan untuk dibaca oleh Gemini AI secara aman.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#153C35] mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          <span>Unggah Berkas Baru (PDF / JPG / PNG Max 15 MB)</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-[#153C35] rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 cursor-pointer">
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
                {selectedFile ? selectedFile.name : "Klik untuk memilih dokumen medis atau seret berkas ke sini"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB • Siap diunggah` : "Mendukung format PDF, JPG, PNG"}
              </p>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {isUploading && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#153C35]" />
                  Menganalisis Dokumen Medis dengan Gemini 1.5 Flash...
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
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#153C35] hover:bg-[#0c2420] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Unggah & Jalankan Ekstraksi AI</span>
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
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#153C35] shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{doc.fileName}</span>
                    <span className="text-[11px] text-slate-500">
                      {(doc.fileSize / 1024).toFixed(1)} KB • Diunggah pada {new Date(doc.uploadedAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;

