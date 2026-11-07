import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Pill,
  ClipboardCheck,
  ShieldAlert,
  History,
  Settings,
  X,
  HeartPulse,
  Sparkles,
} from "lucide-react";

export const Sidebar = ({ activeTab, onTabChange, isMobileOpen, onCloseMobile }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Data Pasien", icon: Users },
    { id: "documents", label: "Dokumen Medis", icon: FileText },
    { id: "medications", label: "Jadwal Obat", icon: Pill },
    { id: "checklists", label: "Checklist Perawatan", icon: ClipboardCheck },
    { id: "alerts", label: "AI Care Alerts", icon: ShieldAlert, badge: "2" },
    { id: "history", label: "Riwayat Perawatan", icon: History },
    { id: "settings", label: "Pengaturan Akun", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#153C35] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  SABANA CEGAK
                </span>
                <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Home Care Companion
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-emerald-300 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-5 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#E8F2ED] text-[#153C35] shadow-sm font-bold"
                      : "text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#153C35]" : "text-emerald-300"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#153C35] text-white"
                          : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-emerald-900/40">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-[11px] text-emerald-200">
            <span className="font-bold text-white block">FIRETECH 2026</span>
            <span>Healthcare AI Innovation</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

