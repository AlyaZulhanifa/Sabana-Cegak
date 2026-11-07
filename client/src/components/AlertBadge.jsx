import React from "react";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Info,
  CheckCircle2,
} from "lucide-react";

/**
 * Komponen AlertBadge & Alert List untuk menampilkan peringatan audit keselamatan medis (Safety Audit)
 * @param {Array} alerts - Array of { level, kategori, pesan }
 */
export const AlertBadge = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Tidak terdeteksi peringatan bahaya atau tulisan terlewat.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const isDanger =
          alert.level?.toLowerCase() === "danger" ||
          alert.kategori?.toLowerCase().includes("bahaya");

        return (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              isDanger
                ? "bg-rose-50/90 border-rose-300 text-rose-900 shadow-sm"
                : "bg-amber-50/90 border-amber-300 text-amber-900 shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isDanger
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isDanger ? (
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isDanger
                        ? "bg-rose-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {isDanger ? "PERINGATAN BAHAYA" : "PERHATIAN PENDAMPING"}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      isDanger
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {alert.kategori || "Peringatan Medis"}
                  </span>
                </div>

                <p className="text-sm font-medium leading-relaxed mt-1">
                  {alert.pesan}
                </p>

                {alert.kategori?.toLowerCase().includes("tulisan") && (
                  <p className="text-xs mt-2 italic opacity-90 flex items-center gap-1 font-normal">
                    <Info className="w-3.5 h-3.5" />
                    Tip: Jangan mengambil keputusan dosis mandiri. Selalu konfirmasi dengan pihak apotek atau dokter RS.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBadge;

