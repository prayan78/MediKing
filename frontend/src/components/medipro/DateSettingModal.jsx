import React, { useState, useEffect } from 'react';
import {
  getBikramSambatDate,
  toAdDateString,
  toBsDateString,
  toAdDateFromBs,
} from '../../utils/nepaliDate';

export default function DateSettingModal({ isOpen, onClose, onDateUpdated }) {
  const [dateSystem, setDateSystem] = useState(
    () => localStorage.getItem('mediking_date_system') || 'BS'
  );

  const getInitialAdDate = () => {
    const saved = localStorage.getItem('mediking_working_date');
    if (saved && !Number.isNaN(new Date(saved).getTime())) {
      return saved;
    }
    return toAdDateString(new Date());
  };

  const [adDate, setAdDate] = useState(getInitialAdDate);
  const [bsDate, setBsDate] = useState(() => toBsDateString(getInitialAdDate()));
  const [bsError, setBsError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentSystem = localStorage.getItem('mediking_date_system') || 'BS';
      const currentAd = getInitialAdDate();
      setDateSystem(currentSystem);
      setAdDate(currentAd);
      setBsDate(toBsDateString(currentAd));
      setBsError('');
      setNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle AD date changes
  const handleAdChange = (newAd) => {
    setAdDate(newAd);
    setBsError('');
    if (newAd) {
      const bs = toBsDateString(newAd);
      if (bs) setBsDate(bs);
    }
  };

  // Handle BS date changes
  const handleBsChange = (newBs) => {
    setBsDate(newBs);
    if (!newBs.trim()) {
      setBsError('Please enter a Bikram Sambat date.');
      return;
    }
    const convertedAd = toAdDateFromBs(newBs.trim());
    if (convertedAd) {
      setAdDate(convertedAd);
      setBsError('');
    } else {
      setBsError('Invalid B.S. format. Use YYYY/MM/DD (e.g. 2083/07/13).');
    }
  };

  // Reset to today
  const handleResetToday = () => {
    const todayAd = toAdDateString(new Date());
    setAdDate(todayAd);
    setBsDate(toBsDateString(todayAd));
    setBsError('');
  };

  // Compute Nepali Date details and Fiscal Year
  const bsDetails = adDate ? getBikramSambatDate(new Date(`${adDate}T12:00:00`)) : null;
  const fiscalYear = bsDetails ? `FY${String(bsDetails.year).slice(-2)}${String(bsDetails.year + 1).slice(-2)}` : 'FY8384';

  const handleSave = (e) => {
    e.preventDefault();
    if (bsError) return;

    localStorage.setItem('mediking_date_system', dateSystem);
    localStorage.setItem('mediking_working_date', adDate);

    window.dispatchEvent(
      new CustomEvent('date-system-changed', { detail: dateSystem })
    );
    window.dispatchEvent(
      new CustomEvent('working-date-changed', {
        detail: {
          adDate,
          bsDate,
          dateSystem,
          fiscalYear,
        },
      })
    );

    if (onDateUpdated) {
      onDateUpdated({
        adDate,
        bsDate,
        dateSystem,
        fiscalYear,
      });
    }

    setNotice('Date settings applied across the Account Department!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-2 font-sans text-xs select-none">
      <div className="w-[520px] max-w-[96vw] border-2 border-slate-600 bg-[#f1f5f9] text-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Title Bar matching MediPro Accounting theme */}
        <div className="flex items-center justify-between bg-[#0f766e] px-3 py-1.5 font-bold text-white text-xs">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>Date Setting · Account Department</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-600 bg-[#f1f5f9] px-1.5 py-0.5 text-xs font-bold text-slate-900 hover:bg-rose-600 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Function Strip */}
        <div className="flex items-center justify-between border-b border-slate-300 bg-[#f0f0f0] px-3 py-1 text-[11px]">
          <span className="font-semibold underline">Function</span>
          <span className="text-slate-500 font-mono">Bikram Sambat (BS) & Anno Domini (AD)</span>
        </div>

        {notice && (
          <div className="border-b border-emerald-300 bg-emerald-100 px-3 py-1.5 text-emerald-800 font-semibold text-center">
            ✓ {notice}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4 bg-white text-xs">
          {/* 1. Date System Selection */}
          <div className="rounded border border-slate-300 bg-slate-50 p-3">
            <div className="font-bold text-slate-700 mb-2">Default Calendar System:</div>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer transition ${
                  dateSystem === 'BS'
                    ? 'border-[#0f766e] bg-teal-50 text-[#0f766e] font-bold shadow-xs'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="dateSystem"
                  value="BS"
                  checked={dateSystem === 'BS'}
                  onChange={() => setDateSystem('BS')}
                  className="accent-[#0f766e]"
                />
                <div>
                  <div>Nepali Date (B.S.)</div>
                  <div className="text-[10px] font-normal text-slate-500">Bikram Sambat Calendar</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer transition ${
                  dateSystem === 'AD'
                    ? 'border-[#0f766e] bg-teal-50 text-[#0f766e] font-bold shadow-xs'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="dateSystem"
                  value="AD"
                  checked={dateSystem === 'AD'}
                  onChange={() => setDateSystem('AD')}
                  className="accent-[#0f766e]"
                />
                <div>
                  <div>English Date (A.D.)</div>
                  <div className="text-[10px] font-normal text-slate-500">Gregorian Calendar</div>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Nepali & English Working Dates */}
          <div className="space-y-3 rounded border border-slate-300 p-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Working / Active System Date:</span>
              <button
                type="button"
                onClick={handleResetToday}
                className="text-[11px] font-semibold text-[#0f766e] hover:underline cursor-pointer"
              >
                ↺ Set to Today
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* English Date AD */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  English Date (A.D.)
                </label>
                <input
                  type="date"
                  value={adDate}
                  onChange={(e) => handleAdChange(e.target.value)}
                  className="w-full border border-slate-400 bg-white px-2 py-1.5 font-mono text-xs rounded-xs"
                />
                <div className="text-[10px] text-slate-500 mt-0.5">Format: YYYY-MM-DD</div>
              </div>

              {/* Nepali Date BS */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nepali Date (B.S.)
                </label>
                <input
                  type="text"
                  value={bsDate}
                  onChange={(e) => handleBsChange(e.target.value)}
                  placeholder="YYYY/MM/DD"
                  className="w-full border border-slate-400 bg-white px-2 py-1.5 font-mono text-xs rounded-xs font-semibold text-[#0f766e]"
                />
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {bsDetails?.formatted || 'e.g. 2083/07/13'}
                </div>
              </div>
            </div>

            {bsError && (
              <div className="text-[11px] text-rose-600 font-semibold">{bsError}</div>
            )}
          </div>

          {/* 3. Impact & Preview */}
          <div className="border border-slate-200 bg-blue-50/60 p-2.5 rounded text-[11px] text-slate-700 space-y-1">
            <div className="font-bold text-blue-900 flex items-center justify-between">
              <span>Account Department Reflection:</span>
              <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                Fiscal Year: {fiscalYear}
              </span>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li>
                <strong>Voucher Entry:</strong> Defaults to {dateSystem === 'BS' ? `B.S. ${bsDate}` : `A.D. ${adDate}`} for new Journal Vouchers.
              </li>
              <li>
                <strong>Account Statements:</strong> Statement filters and date inputs will follow <strong>{dateSystem === 'BS' ? 'Nepali B.S.' : 'English A.D.'}</strong>.
              </li>
              <li>
                <strong>Status Bar:</strong> Account Department header/footer will reflect the chosen calendar and date.
              </li>
            </ul>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-400 bg-white px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-[#0f766e] bg-[#0f766e] text-white px-5 py-1.5 font-bold hover:bg-teal-700 rounded-xs shadow-xs"
            >
              Apply & Reflect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

