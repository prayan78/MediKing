import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  formatSystemDate,
  toBsDateString,
  toAdDateString,
  getBikramSambatDate,
} from '../../utils/nepaliDate';
import JournalVoucherModal from './JournalVoucherModal';
import StatementModal from './StatementModal';
import DateSettingModal from './DateSettingModal';

export default function AccountWorkspace({ onBackToLauncher }) {
  const { currentBranch, user } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [voucherEntryOpen, setVoucherEntryOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [dateSettingOpen, setDateSettingOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const [dateSystem, setDateSystem] = useState(
    () => localStorage.getItem('mediking_date_system') || 'BS'
  );
  const [workingDate, setWorkingDate] = useState(() => {
    return (
      localStorage.getItem('mediking_working_date') || toAdDateString(new Date())
    );
  });

  const accountMenuRef = useRef(null);
  const reportsMenuRef = useRef(null);
  const appMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleSystemChange = (e) => {
      setDateSystem(
        e.detail || localStorage.getItem('mediking_date_system') || 'BS'
      );
    };
    const handleWorkingDateChange = (e) => {
      const detail = e.detail;
      if (typeof detail === 'string') {
        setWorkingDate(detail);
      } else if (detail?.adDate) {
        setWorkingDate(detail.adDate);
        if (detail.dateSystem) setDateSystem(detail.dateSystem);
      }
    };
    window.addEventListener('date-system-changed', handleSystemChange);
    window.addEventListener('working-date-changed', handleWorkingDateChange);
    return () => {
      window.removeEventListener('date-system-changed', handleSystemChange);
      window.removeEventListener('working-date-changed', handleWorkingDateChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inAccount = accountMenuRef.current?.contains(event.target);
      const inReports = reportsMenuRef.current?.contains(event.target);
      const inApp = appMenuRef.current?.contains(event.target);
      if (!inAccount && !inReports && !inApp) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const branchTitle =
    currentBranch?.name?.toUpperCase() ||
    'MEDIKING CENTRAL HOSPITAL (KATHMANDU)';

  const activeDateObj = workingDate
    ? new Date(`${workingDate}T12:00:00`)
    : currentTime;
  const nepaliBsFormatted = toBsDateString(activeDateObj);
  const englishAdFormatted = toAdDateString(activeDateObj);
  const bsDetails = getBikramSambatDate(activeDateObj);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const openJournalVoucher = () => {
    setActiveMenu(null);
    setVoucherEntryOpen(true);
  };
  const openStatement = () => {
    setActiveMenu(null);
    setStatementOpen(true);
  };
  const openDateSetting = () => {
    setActiveMenu(null);
    setDateSettingOpen(true);
  };

  const menuClass = (name) =>
    `rounded-xs px-2 py-1 font-semibold transition ${
      activeMenu === name
        ? 'bg-[#0f766e] text-white'
        : 'text-slate-900 hover:bg-[#0f766e] hover:text-white'
    }`;
  const dropdownClass =
    'absolute left-0 z-50 mt-0.5 min-w-56 border border-slate-400 bg-white py-0.5 text-[11px] text-slate-900 shadow-xl';
  const actionClass =
    'w-full px-3 py-1.5 text-left font-semibold text-blue-900 hover:bg-[#0f766e] hover:text-white';
  const disabledClass =
    'w-full cursor-not-allowed px-3 py-1.5 text-left text-slate-400';

  return (
    <div className="flex h-screen w-full select-none flex-col overflow-hidden bg-[#f8fafc] font-sans">
      <header className="z-30 shrink-0 border-b border-slate-400 bg-[#f1f5f9] text-[11px]">
        <div className="flex items-center justify-between border-b border-slate-300 px-2 py-1 font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span className="tracking-wider text-red-700">{branchTitle}</span>
            <span className="text-slate-400">|</span>
            <span className="font-normal text-slate-600">
              ACCOUNTING SYSTEM
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Date Setting Trigger Pill in Top Bar */}
            <button
              type="button"
              onClick={openDateSetting}
              title="Click to open Date Setting (Nepali & English Date)"
              className="flex items-center gap-1.5 bg-white border border-[#0f766e] hover:bg-teal-50 px-2 py-0.5 rounded text-[10px] text-[#0f766e] font-semibold cursor-pointer shadow-xs transition"
            >
              <span>📅</span>
              <span className="font-bold">
                {dateSystem === 'BS' ? 'BS' : 'AD'}:
              </span>
              <span className="font-mono">
                {dateSystem === 'BS' ? nepaliBsFormatted : englishAdFormatted}
              </span>
              <span className="text-[9px] text-slate-400">
                ({dateSystem === 'BS' ? englishAdFormatted : nepaliBsFormatted})
              </span>
            </button>
            <span className="font-mono text-[10px] font-normal text-slate-600">
              MediKing
            </span>
          </div>
        </div>

        <nav className="relative flex items-center gap-1 px-1 py-0.5">
          {/* Menu Dropdown with Date Setting inside */}
          <div className="relative" ref={appMenuRef}>
            <button
              type="button"
              className={menuClass('app')}
              onClick={() => setActiveMenu(activeMenu === 'app' ? null : 'app')}
            >
              Menu
            </button>
            {activeMenu === 'app' && (
              <div className={dropdownClass}>
                <button
                  type="button"
                  onClick={openDateSetting}
                  className={`${actionClass} flex items-center justify-between font-bold text-teal-800`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📅</span>
                    <span>Date Setting</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {dateSystem}
                  </span>
                </button>
                <div className="border-t border-slate-200 my-0.5" />
                <button
                  type="button"
                  onClick={onBackToLauncher}
                  className={actionClass}
                >
                  Application Selection
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              className={menuClass('account')}
              onClick={() =>
                setActiveMenu(activeMenu === 'account' ? null : 'account')
              }
            >
              Account-Department
            </button>
            {activeMenu === 'account' && (
              <div className={dropdownClass}>
                <div className="group relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-[#0f766e] px-3 py-1.5 text-left font-semibold text-white"
                  >
                    <span>Voucher Entry Section</span>
                    <span>›</span>
                  </button>
                  <div className="absolute left-full top-0 hidden w-64 border border-slate-400 bg-white py-0.5 text-slate-900 shadow-xl group-hover:block group-focus-within:block">
                    <button
                      type="button"
                      onClick={openJournalVoucher}
                      className={actionClass}
                    >
                      Journal Voucher Entry
                    </button>
                    <button type="button" disabled className={disabledClass}>
                      Expense/Purchase Voucher Entry
                    </button>
                    <button type="button" disabled className={disabledClass}>
                      TDS Voucher Entry
                    </button>
                    <button type="button" disabled className={disabledClass}>
                      Payment Voucher
                    </button>
                    <button type="button" disabled className={disabledClass}>
                      Receipt Voucher
                    </button>
                  </div>
                </div>
                <button type="button" disabled className={disabledClass}>
                  Voucher Report Section
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={reportsMenuRef}>
            <button
              type="button"
              className={menuClass('reports')}
              onClick={() =>
                setActiveMenu(activeMenu === 'reports' ? null : 'reports')
              }
            >
              Reports-Account
            </button>
            {activeMenu === 'reports' && (
              <div className={dropdownClass}>
                <button type="button" disabled className={disabledClass}>
                  Quick Balance
                </button>
                <button
                  type="button"
                  onClick={openStatement}
                  className={actionClass}
                >
                  Statement
                </button>
                <button type="button" disabled className={disabledClass}>
                  Supplier Section
                </button>
                <button type="button" disabled className={disabledClass}>
                  Trial Balance
                </button>
                <button type="button" disabled className={disabledClass}>
                  Final Account
                </button>
                <button type="button" disabled className={disabledClass}>
                  Aging
                </button>
                <button type="button" disabled className={disabledClass}>
                  Aging All
                </button>
                <button type="button" disabled className={disabledClass}>
                  Final Report
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToLauncher}
            className="ml-auto rounded-xs px-2 py-1 font-semibold text-rose-700 hover:bg-rose-600 hover:text-white"
          >
            Exit
          </button>
        </nav>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden bg-white">
        <div className="relative h-52 shrink-0 bg-[#0f766e] shadow-md">
          <h1 className="absolute inset-x-4 top-12 text-center font-serif text-2xl font-bold tracking-widest text-white sm:top-16 sm:text-4xl">
            {branchTitle}
          </h1>
          <svg
            className="absolute -bottom-px left-0 h-24 w-full"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,120 L1440,120 L1440,0 C1000,100 400,20 0,120 Z"
              fill="white"
            />
          </svg>
        </div>

        <section className="absolute left-5 top-60 z-10 space-y-3 sm:left-8 sm:top-72">
          <p className="font-mono text-sm font-bold tracking-widest text-[#0f766e]">
            ACCOUNT DEPARTMENT
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={openJournalVoucher}
              className="block rounded border border-slate-300 bg-[#f1f5f9] px-4 py-2 text-left font-semibold text-slate-800 shadow-sm hover:border-blue-500 hover:bg-blue-50"
            >
              Journal Voucher Entry
            </button>
            <button
              type="button"
              onClick={openStatement}
              className="block rounded border border-slate-300 bg-[#f1f5f9] px-4 py-2 text-left font-semibold text-slate-800 shadow-sm hover:border-blue-500 hover:bg-blue-50"
            >
              Account Statement
            </button>
            <button
              type="button"
              onClick={openDateSetting}
              className="block rounded border border-teal-300 bg-teal-50/70 px-4 py-1.5 text-left font-semibold text-teal-900 shadow-sm hover:border-[#0f766e] hover:bg-teal-100 flex items-center gap-2"
            >
              <span>📅</span>
              <span>
                Date Setting ({dateSystem === 'BS' ? 'Nepali B.S.' : 'English A.D.'})
              </span>
            </button>
          </div>
        </section>

        {/* Bottom Status Bar reflecting both Nepali and English Date across Account Department */}
        <div className="flex shrink-0 items-center justify-between border-t-2 border-rose-700 bg-[#0f766e] px-4 py-2 font-mono text-[11px] font-semibold text-white">
          <div className="hidden w-1/3 truncate sm:flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-black/25 text-yellow-300 font-bold uppercase text-[10px]">
              {dateSystem === 'BS' ? 'Nepali B.S.' : 'English A.D.'}
            </span>
            <span className="text-white">
              B.S.: <strong className="text-yellow-200">{nepaliBsFormatted}</strong>
            </span>
            <span className="text-teal-200">|</span>
            <span className="text-slate-200">
              A.D.: <strong className="text-white">{englishAdFormatted}</strong>
            </span>
          </div>
          <span className="w-full text-center font-bold tracking-wider text-yellow-300 sm:w-1/3">
            {formattedTime}
          </span>
          <span className="hidden w-1/3 text-right sm:block">
            {user?.name || 'ACCOUNT USER'} · ACCOUNT DEPARTMENT
          </span>
        </div>
      </main>

      {/* Modals with synced active date */}
      <JournalVoucherModal
        isOpen={voucherEntryOpen}
        onClose={() => setVoucherEntryOpen(false)}
        initialDate={workingDate}
      />
      <StatementModal
        isOpen={statementOpen}
        onClose={() => setStatementOpen(false)}
        initialDate={workingDate}
      />
      <DateSettingModal
        isOpen={dateSettingOpen}
        onClose={() => setDateSettingOpen(false)}
        onDateUpdated={(details) => {
          setWorkingDate(details.adDate);
          setDateSystem(details.dateSystem);
        }}
      />
    </div>
  );
}
