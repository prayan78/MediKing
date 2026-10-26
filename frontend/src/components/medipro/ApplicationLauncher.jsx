import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const applications = [
  { id: 'account', label: 'Account', available: false },
  { id: 'hmis', label: 'HMIS System', available: false },
  { id: 'medipro', label: 'Pharmacy', available: true },
  { id: 'attendance', label: 'Attendance', available: true },
];

export default function ApplicationLauncher({ onSelect }) {
  const { currentBranch, user, logout } = useAuth();
  const navigate = useNavigate();
  const branchTitle = currentBranch?.name?.toUpperCase() || 'NORVIC PHARMACIA P. LTD.';

  const handleExit = () => {
    if (window.confirm('Do you want to log out of MediKing?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f0f2f5] font-sans">
      <header className="shrink-0 border-b border-slate-400 bg-[#ece9d8] text-[11px] text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-300 px-2 py-1">
          <span className="font-semibold">{branchTitle}</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">MediPro</span>
            <button
              type="button"
              onClick={handleExit}
              className="rounded border border-rose-700 px-2 py-0.5 font-semibold text-rose-700 hover:bg-rose-700 hover:text-white"
            >
              Exit
            </button>
          </div>
        </div>
        <div className="px-2 py-1 font-semibold text-slate-700">{user?.name || 'User'}</div>
      </header>

      <main className="relative flex flex-1 overflow-hidden bg-white">
        <div className="relative flex w-full flex-col justify-between overflow-hidden">
          <div className="relative h-40 shrink-0 overflow-hidden bg-[#2b4c7e] shadow-md">
            <h1 className="absolute right-6 top-6 z-10 text-right font-serif text-xl font-bold tracking-wide text-white sm:text-2xl">
              {branchTitle}
            </h1>
            <svg className="absolute bottom-0 left-0 h-28 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,120 L1440,120 L1440,0 C1000,100 400,20 0,120 Z" fill="white" />
            </svg>
          </div>
          <section className="absolute left-8 top-1/3 z-10 flex min-w-48 flex-col items-start gap-4 font-mono text-sm">
            {applications.map((application) => (
              <button
                key={application.id}
                type="button"
                disabled={!application.available}
                onClick={() => onSelect(application.id)}
                className={`text-left tracking-wide ${
                  application.available
                    ? 'text-slate-700 hover:text-blue-800 hover:underline'
                    : 'cursor-not-allowed text-slate-400'
                }`}
                title={application.available ? `Open ${application.label}` : `${application.label} is not available yet`}
              >
                {application.label}
              </button>
            ))}
          </section>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t-2 border-rose-700 bg-[#2b4c7e] px-4 py-2 font-mono text-[11px] text-white">
            <span>Pharmacy Department</span>
            <span>{currentBranch?.name || 'MediKing'}</span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-20 right-12 text-right font-serif text-4xl font-black italic text-[#2b4c7e] sm:text-6xl">
          <span className="text-emerald-600">m</span> MEDI<br />PRO
          <div className="mt-1 text-[9px] tracking-widest text-rose-700">PIONEER IN BUSINESS SOFTWARE</div>
        </div>
      </main>
    </div>
  );
}
