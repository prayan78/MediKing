import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  HeartPulse,
  LogOut,
  Pill,
  Settings,
  Users,
} from 'lucide-react';

const applications = [
  { id: 'account', label: 'Accounts', description: 'Vouchers, ledgers and statements', icon: BarChart3, color: 'bg-violet-50 text-violet-700', roles: ['super_admin', 'hospital_admin', 'accountant'] },
  { id: 'medipro', label: 'Pharmacy', description: 'Sales, inventory and purchases', icon: Pill, color: 'bg-teal-50 text-teal-700', roles: ['super_admin', 'hospital_admin', 'pharmacist', 'inventory_manager', 'accountant'] },
  { id: 'attendance', label: 'Attendance', description: 'Staff shifts and weekly roster', icon: CalendarDays, color: 'bg-blue-50 text-blue-700', roles: ['super_admin', 'hospital_admin', 'nurse', 'receptionist'] },
  { id: 'modern', label: 'Hospital workspace', description: 'Patients, OPD, laboratory and reports', icon: HeartPulse, color: 'bg-rose-50 text-rose-700' },
];

export default function ApplicationLauncher({ onSelect }) {
  const { currentBranch, user, logout, dateSystem } = useAuth();
  const navigate = useNavigate();
  const canAdminister = ['super_admin', 'hospital_admin'].includes(user?.role);
  const visibleApplications = applications.filter((application) => (
    !application.roles ||
    application.roles.includes(user?.role) ||
    application.roles.some((role) => user?.permissions?.includes(role))
  ));

  const openRoute = (path) => {
    localStorage.setItem('mediking_view_mode', 'modern');
    window.dispatchEvent(new CustomEvent('view-mode-changed', { detail: 'modern' }));
    navigate(path);
  };

  const handleExit = () => {
    if (window.confirm('Do you want to log out of MediKing?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white"><HeartPulse size={22} /></div>
          <div><p className="font-bold tracking-tight">MediKing</p><p className="text-[11px] text-slate-500">{currentBranch?.name || 'Hospital operations'}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user?.name || 'Staff member'}</p><p className="text-xs text-slate-500">{user?.role?.replace(/_/g, ' ')} · {dateSystem}</p></div>
          {canAdminister && <button onClick={() => openRoute('/admin')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"><Users size={16} /> Staff & roles</button>}
          {canAdminister && <button onClick={() => openRoute('/settings')} aria-label="System settings" className="rounded-lg border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50"><Settings size={17} /></button>}
          <button onClick={handleExit} aria-label="Sign out" className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700"><LogOut size={17} /></button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-9 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Hospital operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Good to see you, {user?.name?.split(' ')[0] || 'team'}.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Choose a workspace to continue. Your access is tailored to your assigned role.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleApplications.map((application) => {
            const Icon = application.icon;
            return (
              <button
                key={application.id}
                type="button"
                onClick={() => onSelect(application.id)}
                className="group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
              >
                <span className={`mb-7 inline-flex h-11 w-11 items-center justify-center rounded-xl ${application.color}`}><Icon size={21} /></span>
                <span className="flex w-full items-center justify-between text-base font-semibold text-slate-900">
                  {application.label}<ArrowUpRight size={17} className="text-slate-400 transition group-hover:text-teal-700" />
                </span>
                <span className="mt-1 text-xs leading-5 text-slate-500">{application.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Secure hospital workspace</span>
          <span className="inline-flex items-center gap-2"><Building2 size={14} /> {currentBranch?.name || 'MediKing'} <span className="text-slate-300">·</span> {dateSystem} dates</span>
        </div>
      </main>
    </div>
  );
}
