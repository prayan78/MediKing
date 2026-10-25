import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Building,
  User,
  LogOut,
  PlusCircle,
  Menu,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Stethoscope,
  Pill,
  Boxes,
  Layers,
  Sliders,
  Sparkles,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({
  toggleMobileSidebar,
  onOpenNewPatient,
  onOpenProductList,
  onOpenDrugSetup,
}) {
  const { user, branches, currentBranch, switchBranch, logout } = useAuth();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [catalogueMenuOpen, setCatalogueMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);
  const branchMenuRef = useRef(null);
  const catalogueMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target)) {
        setBranchMenuOpen(false);
      }
      if (catalogueMenuRef.current && !catalogueMenuRef.current.contains(event.target)) {
        setCatalogueMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBranchSelect = async (branchId) => {
    try {
      await switchBranch(branchId);
      setBranchMenuOpen(false);
      window.location.reload(); // Refresh stats for selected branch
    } catch (e) {
      alert('Unable to switch branch');
    }
  };

  const handleSwitchToOriginal = () => {
    localStorage.setItem('mediking_view_mode', 'medipro');
    window.dispatchEvent(new CustomEvent('view-mode-changed', { detail: 'medipro' }));
    navigate('/');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'hospital_admin':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pharmacist':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'lab_tech':
      case 'lab_verifier':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accountant':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20 px-4 flex items-center justify-between">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar (MediKing style) */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient (Name/Phone/MRN) or Medicine..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Branch Selector, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Switch to Original MediPro Dashboard Button */}
        <button
          onClick={handleSwitchToOriginal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2b4c7e] hover:bg-[#1e365b] text-white rounded-lg text-xs font-bold transition shadow-xs border border-blue-400/40"
          title="Switch back to Original MediPro Desktop Dashboard"
        >
          <Monitor size={15} className="text-yellow-300" />
          <span className="hidden sm:inline">Original Dashboard</span>
          <span className="sm:hidden">Original</span>
        </button>

        {/* Catalogue Dropdown Menu (Directly accessible everywhere) */}
        <div className="relative" ref={catalogueMenuRef}>
          <button
            onClick={() => setCatalogueMenuOpen(!catalogueMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition border border-slate-200"
            title="Open Pharmacy Master Catalogue"
          >
            <Boxes size={15} className="text-teal-600" />
            <span>Catalogue</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {catalogueMenuOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Pharmacy Master Catalogue
              </div>

              <div className="py-1 text-xs">
                <button
                  onClick={() => {
                    setCatalogueMenuOpen(false);
                    if (onOpenProductList) onOpenProductList();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <Pill size={15} className="text-teal-600 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-teal-900">Product Setup (Catalog)</div>
                      <div className="text-[10px] text-slate-400">Master medicine database & rates</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">F3</span>
                </button>

                <button
                  onClick={() => {
                    setCatalogueMenuOpen(false);
                    if (onOpenDrugSetup) onOpenDrugSetup();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <Sliders size={15} className="text-blue-600 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-teal-900">Drug Setup Categories</div>
                      <div className="text-[10px] text-slate-400">Companies, generics, discounts & racks</div>
                    </div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setCatalogueMenuOpen(false);
                    alert('Cash Party & Customer Ledger module');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2"
                >
                  <span>Cash Party Setup</span>
                </button>

                <button
                  onClick={() => {
                    setCatalogueMenuOpen(false);
                    alert('ICD-10 Diagnostic Codes Catalogue');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2"
                >
                  <span>ICD Code Setup</span>
                </button>

                <button
                  onClick={() => {
                    setCatalogueMenuOpen(false);
                    alert('Organization Member Master');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2"
                >
                  <span>Organization Member Master</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setCatalogueMenuOpen(false);
                    alert('Purchase Re-Order & Tender System');
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2"
                >
                  <span>Place Order & Re-Order</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          onClick={onOpenNewPatient}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg text-xs font-medium shadow-sm hover:from-teal-700 hover:to-emerald-700 transition"
        >
          <PlusCircle size={15} />
          <span>New Patient</span>
        </button>

        {/* Branch Selector Dropdown */}
        <div className="relative" ref={branchMenuRef}>
          <button
            onClick={() => setBranchMenuOpen(!branchMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition border border-slate-200"
            title="Switch Hospital Branch"
          >
            <Building size={14} className="text-teal-600" />
            <span className="max-w-[120px] truncate hidden md:inline">
              {currentBranch?.name || 'Central Hospital'}
            </span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {branchMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Hospital Branches
              </div>
              {branches.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">Main Branch Active</div>
              ) : (
                branches.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => handleBranchSelect(b._id)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{b.name}</div>
                      <div className="text-[11px] text-slate-400">{b.address?.city || 'Nepal'} • {b.code}</div>
                    </div>
                    {currentBranch?._id === b._id && (
                      <CheckCircle2 size={15} className="text-teal-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications & Critical Alerts Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition relative"
            title="System Alerts & Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Pharmacy & Stock Alerts</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                  Active Alerts
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 text-xs">
                <div className="p-3 hover:bg-slate-50 flex gap-2.5 items-start">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Amoxyclav 625 (Batch AMX-23K09)</p>
                    <p className="text-[11px] text-slate-500">Expiring in &lt; 45 days. 18 strips left in stock.</p>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 flex gap-2.5 items-start">
                  <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Calpol 500 (Paracetamol)</p>
                    <p className="text-[11px] text-slate-500">Stock (12 pcs) below reorder threshold (50 pcs).</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name ? user.name.slice(0, 2) : 'MK'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate leading-tight">
                {user?.name || 'Administrator'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role?.replace('_', ' ') || 'User'}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                <div className="text-[10px] text-teal-600 font-medium capitalize mt-0.5">
                  Role: {user?.role?.replace('_', ' ')}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleSwitchToOriginal();
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-semibold"
                >
                  <Monitor size={14} className="text-blue-600" /> Switch to Original Dashboard
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User size={14} /> Profile & Password
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

