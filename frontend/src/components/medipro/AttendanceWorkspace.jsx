import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import WeeklyRosterModal from './WeeklyRosterModal';

const ENTRY_ITEMS = [
  { label: 'Thumb to Attendance' },
  { label: 'Time Table Setup' },
  { label: 'Weekly Roster', action: 'weekly-roster' },
  { label: 'Roster / Over Time form' },
  { label: 'Leave form' },
  { label: 'Over Time Manage' },
  { label: 'Special Event Manage' },
  { divider: true },
  { label: 'Overtime Post' },
  { label: 'Late Mark Post' },
  { label: 'Overtime/Latemark Unpost' },
  { label: 'Overtime Unpost' },
  { label: 'Latemark Unpost' },
  { label: 'Payroll Adjust Post' },
  { label: 'Unpost Payroll Adjust' },
  { label: 'Payroll Adjust Print' },
  { label: 'Advance Salary Generate' },
  { label: 'Employee Time Setup' },
];

export default function AttendanceWorkspace({ onBackToLauncher }) {
  const { currentBranch, user } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [weeklyRosterOpen, setWeeklyRosterOpen] = useState(false);
  const entryMenuRef = useRef(null);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!entryMenuRef.current?.contains(event.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const openWeeklyRoster = () => {
    setActiveMenu(null);
    setWeeklyRosterOpen(true);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f0f2f5] font-sans">
      <header className="shrink-0 border-b border-slate-400 bg-[#ece9d8] text-xs">
        <div className="border-b border-slate-300 px-2 py-1 text-[11px] font-semibold">{currentBranch?.name?.toUpperCase() || 'MEDIKING'} <span className="ml-3 font-normal text-slate-500">Attendance</span></div>
        <div className="flex items-center gap-1 px-1 py-0.5 text-[11px]">
          <button onClick={onBackToLauncher} className="px-2 py-1 hover:bg-[#316ac5] hover:text-white">File</button>
          <div className="relative" ref={entryMenuRef}>
            <button
              onClick={() => setActiveMenu(activeMenu === 'entry' ? null : 'entry')}
              className={`px-2 py-1 ${activeMenu === 'entry' ? 'bg-[#316ac5] text-white' : 'hover:bg-[#316ac5] hover:text-white'}`}
            >
              Entry
            </button>
            {activeMenu === 'entry' && (
              <div className="absolute left-0 top-full z-40 max-h-[80vh] w-56 overflow-y-auto border border-slate-400 bg-white py-0.5 text-slate-900 shadow-xl">
                {ENTRY_ITEMS.map((item) => item.divider
                  ? <div key="entry-divider" className="my-1 border-t border-slate-300" />
                  : (
                    <button
                      key={item.label}
                      onClick={item.action === 'weekly-roster' ? openWeeklyRoster : undefined}
                      disabled={!item.action}
                      className={`w-full px-3 py-1 text-left ${item.action ? 'font-semibold text-blue-900 hover:bg-[#316ac5] hover:text-white' : 'cursor-not-allowed text-slate-400'}`}
                      title={item.action ? '' : 'Not available yet'}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <button onClick={openWeeklyRoster} className="px-2 py-1 hover:bg-[#316ac5] hover:text-white">Report</button>
          <button onClick={onBackToLauncher} className="px-2 py-1 hover:bg-rose-600 hover:text-white">Exit</button>
          <span className="ml-auto px-2 text-slate-600">{user?.name || ''}</span>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col justify-between overflow-hidden bg-white">
        <div className="relative h-40 shrink-0 overflow-hidden bg-[#2b4c7e] shadow-md">
          <h1 className="absolute right-6 top-6 text-right font-serif text-xl font-bold tracking-wide text-white sm:text-2xl">
            {currentBranch?.name?.toUpperCase() || 'MEDIKING'}
          </h1>
          <svg className="absolute bottom-0 left-0 h-28 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,120 L1440,120 L1440,0 C1000,100 400,20 0,120 Z" fill="white" />
          </svg>
        </div>
        <div className="flex flex-1 items-center justify-between px-10">
          <div className="font-mono text-lg text-slate-400">Attendance</div>
          <div className="font-serif text-5xl font-black italic text-[#2b4c7e]"><span className="text-emerald-600">m</span> MEDI<br />PRO</div>
        </div>
        <div className="border-t-2 border-rose-700 bg-[#2b4c7e] px-4 py-2 font-mono text-[11px] text-white">
          Select Entry → Weekly Roster to manage employee schedules.
        </div>
      </main>

      <WeeklyRosterModal
        isOpen={weeklyRosterOpen}
        onClose={() => setWeeklyRosterOpen(false)}
        initialDepartment={currentBranch?.name || ''}
      />
    </div>
  );
}
