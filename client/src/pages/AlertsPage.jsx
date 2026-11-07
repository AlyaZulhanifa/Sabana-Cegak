import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Info,
  PhoneCall,
  Check,
} from "lucide-react";
import { getCareAlerts, resolveCareAlert } from "../services/api";

export const AlertsPage = ({ activePatient }) => {
  const [alerts, setAlerts] = useState([]);
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  const patientId = activePatient?.id;

  const loadAlerts = async () => {
    if (!patientId) {
      setAlerts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await getCareAlerts(patientId);
      setAlerts(res.data || []);
    } catch (e) {
      console.error("Gagal memuat alerts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [patientId]);

  const handleResolve = async (id) => {
    try {
      await resolveCareAlert(id, { resolvedBy: activePatient?.primaryCaregiver || "Keluarga" });
      loadAlerts();
    } catch (e) {
      alert("Gagal memperbarui status alert: " + e.message);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterLevel === "Semua") return true;
    return a.level?.toLowerCase() === filterLevel.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            AI Care Alerts & Safety Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Peringatan otomatis atas tulisan resep tidak jelas, tanggal kontrol terlewat, dan tanda bahaya komplikasi pasca rawat.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {["Semua", "Warning", "Danger"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterLevel === level
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Notice Card */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-rose-950">
        <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs sm:text-sm">
          <span className="font-black text-rose-900 block mb-0.5">
            Protokol Tanda Bahaya (Red Flags) Rumah Sakit:
          </span>
          Jika pasien mengalami demam tinggi &gt; 38.5°C, pendarahan aktif pada luka operasi, sesak napas berat, atau muntah terus-menerus, jangan menunggu verifikasi AI. Segera bawa ke IGD Rumah Sakit terdekat atau hubungi <strong>Ambulans Darurat 119</strong>.
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Tidak ada peringatan aktif saat ini.
          </div>
        ) : (
          filtered.map((alert) => {
            const isDanger = alert.level?.toLowerCase() === "danger";
            const isResolved = alert.status === "RESOLVED";

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? "bg-slate-50/60 border-slate-200 opacity-70"
                    : isDanger
                    ? "bg-rose-50/90 border-rose-300 shadow-xs"
                    : "bg-amber-50/80 border-amber-300 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isDanger ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isDanger ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isDanger ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
                          }`}
                        >
                          {isDanger ? "Tanda Bahaya Medis" : "Perhatian Caregiver"}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {alert.category}
                        </span>
                        {isResolved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            ✓ Dikonfirmasi
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900 leading-relaxed mt-1">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                        <span>Sumber: {alert.source || "Gemini AI Safety Audit"}</span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resolve action */}
                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs self-end sm:self-center shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sudah Dikonfirmasi</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPage;

