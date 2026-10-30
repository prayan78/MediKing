import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  BedDouble,
  Pill,
  FlaskConical,
  Receipt,
  Boxes,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, shortcut: 'Alt+D' },
  { name: 'Patients', path: '/patients', icon: Users, shortcut: 'Alt+P' },
  { name: 'OPD & Consultations', path: '/opd', icon: Stethoscope, roles: ['super_admin', 'hospital_admin', 'doctor', 'receptionist', 'nurse'] },
  { name: 'IPD & Admissions', path: '/ipd', icon: BedDouble, roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse'] },
  { name: 'Pharmacy & POS', path: '/pharmacy', icon: Pill, shortcut: 'F2', roles: ['super_admin', 'hospital_admin', 'pharmacist', 'accountant'] },
  { name: 'Laboratory', path: '/laboratory', icon: FlaskConical, roles: ['super_admin', 'hospital_admin', 'lab_tech', 'lab_verifier', 'doctor'] },
  { name: 'Billing & Cashier', path: '/billing', icon: Receipt, roles: ['super_admin', 'hospital_admin', 'accountant', 'receptionist', 'pharmacist'] },
  { name: 'Inventory & Store', path: '/inventory', icon: Boxes, roles: ['super_admin', 'hospital_admin', 'inventory_manager', 'pharmacist'] },
  { name: 'Administration', path: '/admin', icon: Building2, roles: ['super_admin', 'hospital_admin'] },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['super_admin', 'hospital_admin', 'accountant'] },
  { name: 'System Settings', path: '/settings', icon: Settings, roles: ['super_admin', 'hospital_admin'] },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();

  const userRole = user?.role || '';
  const filteredNav = navigationItems.filter(
    (item) =>     !item.roles ||
    item.roles.includes(userRole) ||
    userRole === 'super_admin' ||
    item.roles.some((role) => user?.permissions?.includes(role))
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out bg-[#102a35] border-r border-[#1d3c47] text-slate-200 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1d3c47] bg-[#0c222b]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-300 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-teal-500/20">
              MK
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
                MediKing <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">ERP</span>
              </div>
              <div className="text-[10px] text-slate-400">Hospital & Pharmacy System</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-300 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-teal-500/20">
            MK
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden md:block"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-200 border-l-4 border-teal-300 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.name}</span>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.name}
                  {item.shortcut && <span className="ml-2 text-teal-400">({item.shortcut})</span>}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Switch to Original MediPro Dashboard */}
      <div className="px-3 pb-2">
        <button
          onClick={() => {
            localStorage.setItem('mediking_view_mode', 'medipro');
            window.dispatchEvent(new CustomEvent('view-mode-changed', { detail: 'medipro' }));
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-200 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 transition shadow-xs group"
          title="Switch to Original MediPro Desktop Dashboard"
        >
          <Monitor size={16} className="text-yellow-400 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Original Dashboard</span>}
        </button>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-[#1d3c47] bg-[#0c222b]/70">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MediKing Core v1.0</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">IRD Ready</span>
          </div>
        ) : (
          <div className="flex justify-center" title="MediKing Core Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
