import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FileCheck,
  Sparkles,
} from "lucide-react";

export const DocumentUploader = ({
  onUpload,
  isLoading,
  uploadProgress,
  onLoadMock,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    setErrorMsg("");
    if (!file) return;

    // Validasi tipe berkas
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setErrorMsg("Format berkas tidak didukung. Harap pilih PDF atau Gambar (JPG, PNG, WEBP).");
      return;
    }

    // Validasi ukuran berkas (maksimal 15 MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Ukuran file melebihi batas 15 MB.");
      return;
    }

    setSelectedFile(file);

    // Buat thumbnail jika file berupa gambar
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Silakan pilih dokumen medis terlebih dahulu.");
      return;
    }
    onUpload(selectedFile);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-brand-600" />
            Unggah Dokumen Rawat Jalan / Resep RS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lampirkan Resume Medis (Discharge Summary), Catatan Dokter, atau Foto Resep Tulisan Tangan
          </p>
        </div>

        {/* Quick Demo Button for Hackathon */}
        {onLoadMock && (
          <button
            type="button"
            onClick={onLoadMock}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-brand-700 hover:bg-emerald-100 border border-brand-200 transition-colors self-start sm:self-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Gunakan Sampel Demo</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? "border-brand-500 bg-brand-50/60 scale-[1.01]"
                : "border-slate-300 hover:border-brand-400 hover:bg-slate-50/70"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-sm border border-brand-100">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-slate-800">
                Klik untuk memilih berkas atau geser (drag & drop) ke sini
              </p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                Mendukung berkas PDF atau Foto Kamera (JPG, PNG, WEBP) hingga 15 MB
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-100">PDF</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100">Tulisan Tangan</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100">Resep Farmasi</span>
              </div>
            </div>
          </div>
        ) : (
          /* File Preview Card */
          <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {previewUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Pratinjau dokumen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-hospital-100 border border-hospital-200 flex items-center justify-center text-hospital-700 shrink-0 shadow-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                      {selectedFile.type.includes("pdf") ? "PDF" : "GAMBAR"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses oleh AI
                  </p>
                </div>
              </div>

              {!isLoading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Ganti Berkas"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading Progress State */}
        {isLoading && (
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                Menganalisis Dokumen Medis dengan Gemini 1.5 Flash...
              </span>
              <span>{uploadProgress || 85}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress || 85}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 italic">
              AI sedang memvalidasi nama obat, jadwal minum, instruksi luka/nutrisi, dan mengecek ketidakjelasan tulisan tangan.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
            !selectedFile || isLoading
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-[0.99]"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Dokumen Medis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Ekstrak & Audit Keselamatan Medis</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DocumentUploader;

