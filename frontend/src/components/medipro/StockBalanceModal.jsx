import React, { useState } from 'react';

export default function StockBalanceModal({
  isOpen,
  onClose,
  onOpenReport,
}) {
  const [selectedFunction, setSelectedFunction] = useState('valuation');

  if (!isOpen) return null;

  const handleReportClick = () => {
    if (selectedFunction === 'valuation') {
      if (onOpenReport) {
        onOpenReport();
      }
    } else {
      alert(`Report for: ${selectedFunction.toUpperCase()} will open.`);
    }
  };

  const functionOptions = [
    { id: 'valuation', label: 'Stock Balance / Valuation', enabled: true },
    { id: 's_price', label: 'Stock Balance Current on S Price', enabled: true },
    { id: 'rackwise', label: 'Rackwise Stock Balance', enabled: true },
    { id: 'detail', label: 'Stock Detail', enabled: true },
    { id: 'itemwise_dept', label: 'Itemwise Department Stock', enabled: true },
    { id: 'balance_all', label: 'Stock Balance All', enabled: false },
    { id: 'balance_all_tran', label: 'Stock Balance All (with Tran Id)', enabled: true },
    { id: 'product_lock', label: 'Product Lock List', enabled: true },
    { id: 'balance_reg', label: 'Stock Balance Register', enabled: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 3 */}
      <div className="w-[360px] max-w-[95vw] bg-[#ece9d8] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800">
        {/* Title Bar */}
        <div className="bg-[#2b4c7e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <span>Stock Balance</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Function Section */}
        <div className="p-3 bg-[#ece9d8] flex flex-col space-y-2">
          <div className="text-[11px] font-semibold text-slate-700">Function</div>

          {/* Radio Group List */}
          <div className="space-y-1.5 pl-4 text-[11px] text-slate-800 py-1">
            {functionOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 ${
                  opt.enabled
                    ? 'cursor-pointer hover:text-blue-900'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
                onDoubleClick={() => {
                  if (opt.enabled) {
                    setSelectedFunction(opt.id);
                    if (opt.id === 'valuation' && onOpenReport) {
                      onOpenReport();
                    }
                  }
                }}
              >
                <input
                  type="radio"
                  name="stock_balance_function"
                  disabled={!opt.enabled}
                  checked={selectedFunction === opt.id}
                  onChange={() => opt.enabled && setSelectedFunction(opt.id)}
                  className="accent-blue-700 cursor-pointer"
                />
                <span
                  className={
                    selectedFunction === opt.id
                      ? 'font-bold text-blue-950'
                      : opt.enabled
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Bottom Buttons Bar */}
        <div className="bg-[#f0f0f0] border-t border-slate-300 px-3 py-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReportClick}
            className="w-24 py-1 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs text-center active:translate-y-px"
          >
            Report
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-24 py-1 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs text-center active:translate-y-px"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

