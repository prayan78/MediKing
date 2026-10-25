import React, { useState } from 'react';

export default function PurchaseRegisterModal({
  isOpen,
  onClose,
  onOpenPurchaseBook,
}) {
  const [activeTab, setActiveTab] = useState('Purchase');
  const [selectedReport, setSelectedReport] = useState('purchase_book');
  const [dateType, setDateType] = useState('BS');
  const [byDateMonth, setByDateMonth] = useState('Date');
  const [fromDate, setFromDate] = useState('2078/05/01');
  const [toDate, setToDate] = useState('2078/05/14');

  if (!isOpen) return null;

  const handleGenerateReport = () => {
    if (selectedReport === 'purchase_book') {
      onClose();
      if (onOpenPurchaseBook) {
        onOpenPurchaseBook({ fromDate, toDate, dateType });
      }
    } else {
      alert(`Generating ${selectedReport.replace(/_/g, ' ').toUpperCase()} report for ${fromDate} to ${toDate}...`);
    }
  };

  const reportOptions = [
    { id: 'purchase_book', label: 'Purchase Book' },
    { id: 'prod_supplier', label: 'Productwise Supplier Purchase' },
    { id: 'company_purch', label: 'Companywise Purchase' },
    { id: 'supplier_purch', label: 'Supplierwise Purchase' },
    { id: 'supplier_sum', label: 'Supplierwise Purchase Summary' },
    { id: 'adj_stock', label: 'Adjustment Stock List' },
    { id: 'purch_detail', label: 'Purchase Detail' },
    { id: 'company_sum', label: 'Companywise Purchase Summary' },
    { id: 'price_compare', label: 'Product Price Compare' },
    { id: 'comp_vs_supp', label: 'Company Vs Supplier' },
    { id: 'vat_register', label: 'Purchase Vat Register' },
    { id: 'supp_net', label: 'Supplier Net Purchase' },
    { id: 'export_100k', label: 'Purchase/Sales (more then 100,000.00) Export' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 4 */}
      <div className="w-[580px] max-w-[95vw] bg-[#ece9d8] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800">
        {/* Title Bar */}
        <div className="bg-[#2b4c7e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <span>Purchase / Return / Adjust Register</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Function Strip */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700">
          <span className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold">Function</span>
        </div>

        {/* Tabs: Purchase, Purchase Return, Adjustment */}
        <div className="flex border-b border-slate-400 bg-[#dfdbcd] px-2 pt-1 gap-1">
          {['Purchase', 'Purchase Return', 'Adjustment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-t-xs border-t border-l border-r ${
                activeTab === tab
                  ? 'bg-[#ece9d8] border-slate-500 text-slate-900 -mb-px'
                  : 'bg-[#cfcbbe] border-slate-400 text-slate-700 hover:bg-[#e4e0d4]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body Area with Options and Floating Date Range (Image 4) */}
        <div className="p-3 bg-[#ece9d8] relative min-h-[340px]">
          {/* Radio Options List */}
          <div className="space-y-1.5 text-[11px] text-slate-800 w-2/3">
            {reportOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer hover:text-blue-900" onDoubleClick={handleGenerateReport}
              >
                <input
                  type="radio"
                  name="purchase_report"
                  checked={selectedReport === opt.id}
                  onChange={() => setSelectedReport(opt.id)}
                  className="accent-blue-700"
                />
                <span className={selectedReport === opt.id ? 'font-bold text-blue-950' : ''}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Floating Date Range Dialog (Exact replica of Image 4) */}
          <div className="absolute right-3 top-4 w-52 bg-[#ece9d8] border-2 border-slate-600 shadow-xl text-xs">
            {/* Title Bar */}
            <div className="bg-[#2b4c7e] text-white px-2 py-0.5 font-bold text-[11px]">
              Date Range
            </div>
            <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[10px] text-slate-600">
              Function
            </div>

            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Date Type</span>
                <select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value)}
                  className="w-24 bg-white border border-slate-400 px-1 py-0.5 text-xs font-mono"
                >
                  <option value="BS">BS</option>
                  <option value="AD">AD</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold">By Date/Month</span>
                <select
                  value={byDateMonth}
                  onChange={(e) => setByDateMonth(e.target.value)}
                  className="w-24 bg-white border border-slate-400 px-1 py-0.5 text-xs"
                >
                  <option value="Date">Date</option>
                  <option value="Month">Month</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold">From</span>
                <input
                  type="text"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold">To</span>
                <input
                  type="text"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => alert(`Date filter set from ${fromDate} to ${toDate}`)}
                  className="w-full py-1 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions matching Image 4 */}
        <div className="bg-[#ece9d8] border-t border-slate-300 p-2 flex items-center justify-center gap-4">
          <button
            onClick={handleGenerateReport}
            className="w-28 py-1 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs"
          >
            Report
          </button>
          <button
            onClick={onClose}
            className="w-28 py-1 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

