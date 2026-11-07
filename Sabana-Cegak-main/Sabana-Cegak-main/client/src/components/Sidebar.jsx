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
  Sparkles,
} from "lucide-react";
import logoImg from "../assets/images/Logo Sabana Cegak.png";

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F4643] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-teal-800/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-[#86D2DC]/30 flex items-center justify-center p-1.5 shadow-xs shrink-0">
                <img
                  src={logoImg}
                  alt="Logo SABANA CEGAK"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block leading-tight">
                  SABANA CEGAK
                </span>
                <span className="text-[10px] text-[#86D2DC] font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#11B5AE]" /> Care Better. Together.
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-teal-200 hover:text-white lg:hidden"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
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
                      ? "bg-[#EAF8F8] text-[#0F4643] shadow-sm font-bold"
                      : "text-teal-100/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#11B5AE]" : "text-[#86D2DC]"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#0F4643] text-[#86D2DC]"
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
        <div className="p-4 border-t border-teal-800/40">
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 text-[11px] text-teal-100">
            <span className="font-bold text-[#86D2DC] block">FIRETECH 2026</span>
            <span>Healthcare AI Innovation</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
