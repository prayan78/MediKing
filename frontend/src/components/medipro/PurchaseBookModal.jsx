import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatSystemDate } from '../../utils/nepaliDate';
import { useAuth } from '../../context/AuthContext';

export default function PurchaseBookModal({
  isOpen,
  onClose,
  initialDateRange,
}) {
  const { dateSystem } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [fromDate, setFromDate] = useState(initialDateRange?.fromDate || formatSystemDate(new Date()));
  const [toDate, setToDate] = useState(initialDateRange?.toDate || formatSystemDate(new Date()));
  const [currency, setCurrency] = useState('NC');
  const [bulk, setBulk] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPurchases();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!initialDateRange) {
      const today = formatSystemDate(new Date());
      setFromDate(today);
      setToDate(today);
    }
  }, [dateSystem, initialDateRange]);

  const closeModal = () => {
    setSearch('');
    setSelectedIndex(0);
    onClose();
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchases?limit=200');
      setPurchases(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load purchase book:', err);
      setError('Failed to load purchases from database.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.mrnNo?.toLowerCase().includes(term) ||
      p.billNo?.toLowerCase().includes(term) ||
      p.supplierName?.toLowerCase().includes(term) ||
      p.purchDateBs?.includes(term)
    );
  });

  const totalAmount = filteredPurchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const totalNet = filteredPurchases.reduce((sum, p) => sum + (Number(p.netAmount) || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 5 */}
      <div className="w-[1100px] max-w-[98vw] max-h-[96vh] bg-[#f1f5f9] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#0f766e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300">📖</span>
            <span>Purchase Book</span>
          </div>
          <button
            onClick={closeModal}
            className="w-4 h-4 bg-[#f1f5f9] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Menu Bar matching Image 5 */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold"
            >
              Report
            </button>
            <button
              onClick={closeModal}
              className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold"
            >
              Exit
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">MediKing Fiscal Purchase Register</span>
        </div>

        {/* Date Filter & Search Strip matching Image 5 */}
        <div className="p-2 bg-[#f1f5f9] border-b border-slate-300 space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchPurchases}
              className="px-3 py-0.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs"
            >
              Date Range
            </button>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">From</span>
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">To</span>
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by MRN, Bill No, or Supplier..."
                className="w-full px-2 py-1 bg-white border border-slate-400 text-xs shadow-inner focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-16 bg-white border border-slate-400 px-1 py-0.5 text-xs font-mono"
              >
                <option value="NC">NC</option>
                <option value="IC">IC</option>
                <option value="USD">USD</option>
              </select>

              <label className="flex items-center gap-1 text-slate-700 font-semibold cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={bulk}
                  onChange={(e) => setBulk(e.target.checked)}
                />
                <span>Bulk</span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Grid matching Image 5 */}
        <div className="flex-1 bg-white border-b border-slate-400 overflow-y-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Loading purchase book from database...</div>
          ) : error ? (
            <div className="p-4 text-center text-rose-600 text-xs">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead className="bg-[#f1f5f9] sticky top-0 border-b border-slate-400 text-slate-800 font-semibold select-none z-10">
                <tr>
                  <th className="w-5 py-1 px-1 border-r border-slate-300"></th>
                  <th className="py-1 px-2 border-r border-slate-300 w-20">Date</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-24">Inv_no</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-20">Bill No</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-20">Bill Date</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-10 text-center">Cash</th>
                  <th className="py-1 px-2 border-r border-slate-300">Particular</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-20 text-right">Amount</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-16 text-right">CC Charge</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-16 text-right">CC Free</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-16 text-right">Discount</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-14 text-right">Vat</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-16 text-right">free_vat</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-20 text-right font-bold">Net</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-10 text-center">User</th>
                  <th className="py-1 px-1 border-r border-slate-300 w-10 text-center">Age</th>
                  <th className="py-1 px-2 w-24">Username</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="17" className="p-8 text-center text-slate-400 italic">
                      No purchase records found. Create one using "Purchase Entry".
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <tr
                        key={p._id || p.mrnNo}
                        onClick={() => setSelectedIndex(index)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#0f766e] text-white font-medium'
                            : index % 2 === 0
                            ? 'bg-white hover:bg-blue-50 text-slate-900'
                            : 'bg-[#fbfbf9] hover:bg-blue-50 text-slate-900'
                        }`}
                      >
                        <td className="py-0.5 px-1 text-center border-r border-slate-200">
                          {isSelected && <span className="text-[9px]">▶</span>}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-mono text-[10px]">
                          {p.purchDateAd ? formatSystemDate(p.purchDateAd) : p.purchDateBs || '-'}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-mono font-bold">
                          {p.mrnNo}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-mono text-[10px]">
                          {p.billNo || '-'}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-mono text-[10px]">
                          {p.billDateAd ? formatSystemDate(p.billDateAd) : p.billDateBs || '-'}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-center font-mono font-bold">
                          {p.cashParty || 'N'}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-bold uppercase truncate max-w-[200px]">
                          {p.supplierName}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono">
                          {Number(p.totalAmount).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono">
                          {Number(p.ccCharge || 0).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono">
                          {Number(p.ccFree || 0).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono">
                          {Number(p.discount || 0).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono">
                          {Number(p.vat || 0).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono">
                          {Number(p.freeVat || 0).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono font-extrabold">
                          {Number(p.netAmount || p.totalAmount).toFixed(2)}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-center font-mono">
                          {p.userCode || 0}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-200 text-center font-mono">
                          {p.age || 0}
                        </td>
                        <td className="py-0.5 px-2 font-mono text-[10px] uppercase truncate max-w-[100px]">
                          {p.username || 'ADMINISTRATOR'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Status & Summary Totals matching Image 5 */}
        <div className="bg-[#f1f5f9] border-t border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Total Invoices: {filteredPurchases.length}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Total Amount:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 border border-slate-400">
                Rs. {totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900">Total Net:</span>
              <span className="font-mono font-extrabold text-blue-900 bg-white px-2 py-0.5 border border-slate-400">
                Rs. {totalNet.toFixed(2)}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="px-4 py-0.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
