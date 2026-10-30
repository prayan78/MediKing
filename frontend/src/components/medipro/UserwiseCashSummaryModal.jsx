import React, { useState } from 'react';

const DEFAULT_CASH_SUMMARY = [
  {
    id: 1,
    userName: 'ADMIN',
    cashReceive: 24500.0,
    sales: 24500.0,
    receipt: 0.0,
    card: 0.0,
    drNote: 0.0,
    cashIn: 0.0,
    returnVal: 0.0,
    cashOut: 0.0,
    crNote: 0.0,
    purch: 0.0,
    net: 24500.0,
    handOver: 0.0,
  },
  {
    id: 2,
    userName: 'PHARMACY1',
    cashReceive: 18250.0,
    sales: 19000.0,
    receipt: 0.0,
    card: 1500.0,
    drNote: 0.0,
    cashIn: 0.0,
    returnVal: 750.0,
    cashOut: 0.0,
    crNote: 0.0,
    purch: 0.0,
    net: 18250.0,
    handOver: 0.0,
  },
  {
    id: 3,
    userName: 'CASHIER2',
    cashReceive: 32100.0,
    sales: 32100.0,
    receipt: 0.0,
    card: 3200.0,
    drNote: 0.0,
    cashIn: 0.0,
    returnVal: 0.0,
    cashOut: 0.0,
    crNote: 0.0,
    purch: 0.0,
    net: 32100.0,
    handOver: 0.0,
  },
  {
    id: 4,
    userName: 'NIGHT_SHIFT',
    cashReceive: 8450.0,
    sales: 8450.0,
    receipt: 0.0,
    card: 0.0,
    drNote: 0.0,
    cashIn: 0.0,
    returnVal: 0.0,
    cashOut: 0.0,
    crNote: 0.0,
    purch: 0.0,
    net: 8450.0,
    handOver: 0.0,
  },
];

export default function UserwiseCashSummaryModal({
  isOpen,
  onClose,
  initialFromDate = '2078/05/01',
  initialToDate = '2078/05/14',
}) {
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [allFirm, setAllFirm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);

  // Date Range Popup state (Image 4)
  const [dateRangePopupOpen, setDateRangePopupOpen] = useState(false);
  const [popupDateType, setPopupDateType] = useState('BS');
  const [popupByDateMonth, setPopupByDateMonth] = useState('Date');
  const [popupFromDate, setPopupFromDate] = useState(initialFromDate);
  const [popupToDate, setPopupToDate] = useState(initialToDate);

  if (!isOpen) return null;

  const handleApplyDateRange = () => {
    setFromDate(popupFromDate);
    setToDate(popupToDate);
    setDateRangePopupOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 4 */}
      <div className="w-[1100px] max-w-[98vw] max-h-[96vh] bg-[#f1f5f9] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800 overflow-hidden relative">
        {/* Title Bar */}
        <div className="bg-[#0f766e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <span>Userwise Cash Summary</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#f1f5f9] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Menu Bar: Report Exit */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold"
            >
              Report
            </button>
            <button
              onClick={onClose}
              className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold"
            >
              Exit
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Fiscal Cash Collection & Reconciliation
          </span>
        </div>

        {/* Filter Toolbar (Image 4) */}
        <div className="p-2 bg-[#f1f5f9] border-b border-slate-300 flex items-center gap-2 flex-wrap text-[11px]">
          {/* Date Range Button that triggers the Popup */}
          <button
            type="button"
            onClick={() => {
              setPopupFromDate(fromDate);
              setPopupToDate(toDate);
              setDateRangePopupOpen(true);
            }}
            className="px-3 py-1 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border-2 border-[#0055ea] font-bold text-[#0055ea] rounded-xs shadow-xs text-xs cursor-pointer active:translate-y-px"
          >
            Date Range
          </button>

          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700">From</span>
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-24 bg-white border border-slate-400 px-1.5 py-0.5 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700">To</span>
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-24 bg-white border border-slate-400 px-1.5 py-0.5 font-mono text-xs"
            />
          </div>

          <label className="flex items-center gap-1 cursor-pointer ml-3">
            <span className="font-semibold text-slate-700">All Firm</span>
            <input
              type="checkbox"
              checked={allFirm}
              onChange={(e) => setAllFirm(e.target.checked)}
              className="accent-blue-700"
            />
          </label>
        </div>

        {/* Data Table matching Image 4 */}
        <div className="flex-1 bg-white overflow-auto border-t border-slate-300">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#e2e8f0] sticky top-0 border-b border-slate-400 text-slate-900 select-none z-10 text-[11px]">
              <tr>
                <th className="p-1 px-1.5 border-r border-slate-300 text-center w-8">Id</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold w-28">UserName</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">
                  cash_receive
                </th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">Sales</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">Receipt</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">Card</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">DrNote</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">CashIn</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">Return</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">CashOut</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">CrNote</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right">Purch</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold text-right font-bold text-blue-900">
                  Net
                </th>
                <th className="p-1 px-2 font-semibold text-right">Hand Over</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_CASH_SUMMARY.map((row, idx) => {
                const isSelected = selectedRow === idx;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(idx)}
                    className={`cursor-pointer transition-colors border-b border-slate-100 ${
                      isSelected ? 'bg-[#0f766e] text-white' : idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
                    }`}
                  >
                    <td className="p-1 px-1.5 border-r border-slate-200 text-center font-mono">
                      {row.id}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-bold">{row.userName}</td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.cashReceive.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.sales.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.receipt.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.card.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.drNote.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.cashIn.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right text-amber-800">
                      {row.returnVal.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.cashOut.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.crNote.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-mono text-right">
                      {row.purch.toFixed(2)}
                    </td>
                    <td
                      className={`p-1 px-2 border-r border-slate-200 font-mono text-right font-bold ${
                        isSelected ? 'text-white' : 'text-blue-900'
                      }`}
                    >
                      {row.net.toFixed(2)}
                    </td>
                    <td className="p-1 px-2 font-mono text-right">{row.handOver.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#f1f5f9] border-t border-slate-300 px-3 py-1 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              Total Cash Collected:{' '}
              <strong className="text-blue-950 font-mono">
                Rs.{' '}
                {DEFAULT_CASH_SUMMARY.reduce((sum, r) => sum + r.net, 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Date Range: {fromDate} to {toDate}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Date Range Popup Dialog (Exact replica inside Image 4)             */}
        {/* ------------------------------------------------------------------ */}
        {dateRangePopupOpen && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-40">
            <div className="w-[280px] bg-[#f1f5f9] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800">
              {/* Title */}
              <div className="bg-[#0f766e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
                <span>Date Range</span>
                <button
                  onClick={() => setDateRangePopupOpen(false)}
                  className="w-4 h-4 bg-[#f1f5f9] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
                >
                  ×
                </button>
              </div>

              {/* Function Label */}
              <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700">
                <span className="font-semibold">Function</span>
              </div>

              {/* Popup Fields */}
              <div className="p-3 bg-[#f1f5f9] space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Date Type</span>
                  <select
                    value={popupDateType}
                    onChange={(e) => setPopupDateType(e.target.value)}
                    className="w-28 bg-white border border-slate-400 px-1 py-0.5 text-xs"
                  >
                    <option value="BS">BS</option>
                    <option value="AD">AD</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">By Date/Month</span>
                  <select
                    value={popupByDateMonth}
                    onChange={(e) => setPopupByDateMonth(e.target.value)}
                    className="w-28 bg-white border border-slate-400 px-1 py-0.5 text-xs"
                  >
                    <option value="Date">Date</option>
                    <option value="Month">Month</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">From</span>
                  <input
                    type="text"
                    value={popupFromDate}
                    onChange={(e) => setPopupFromDate(e.target.value)}
                    className="w-28 bg-white border border-slate-400 px-1.5 py-0.5 font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">To</span>
                  <input
                    type="text"
                    value={popupToDate}
                    onChange={(e) => setPopupToDate(e.target.value)}
                    className="w-28 bg-white border border-slate-400 px-1.5 py-0.5 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Set Button */}
              <div className="bg-[#f0f0f0] border-t border-slate-300 p-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleApplyDateRange}
                  className="w-24 py-1 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs text-center active:translate-y-px cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

