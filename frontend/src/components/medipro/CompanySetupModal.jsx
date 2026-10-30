import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function CompanySetupModal({ isOpen, onClose, onSelectCompany }) {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Company Entry Form (F6)
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({
    compCode: '',
    refCode: '',
    companyName: '',
    ncBill: true,
    superStock: false,
    custom: 7.5,
    ncTrade: false,
  });

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const closeModal = () => {
    setSearch('');
    setSelectedIndex(0);
    setShowNewCompany(false);
    onClose();
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies?limit=200');
      setCompanies(res.data.data || []);
      setFilteredCompanies(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCompanies(companies);
    } else {
      const term = search.toLowerCase();
      const filtered = companies.filter(
        (c) =>
          String(c.compCode).includes(term) ||
          c.refCode?.toLowerCase().includes(term) ||
          c.companyName?.toLowerCase().includes(term)
      );
      setFilteredCompanies(filtered);
    }
    setSelectedIndex(0);
  }, [search, companies]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCompanies.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCompanies[selectedIndex]) {
        handleSelect(filteredCompanies[selectedIndex]);
      }
    } else if (e.key === 'F6') {
      e.preventDefault();
      setShowNewCompany(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (showNewCompany) {
        setShowNewCompany(false);
      } else {
        closeModal();
      }
    }
  };

  const handleSelect = (company) => {
    if (onSelectCompany) {
      onSelectCompany(company);
    }
    closeModal();
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/companies', newCompanyForm);
      if (res.data.success) {
        setShowNewCompany(false);
        await fetchCompanies();
        handleSelect(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create company');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 select-none font-sans"
      onKeyDown={handleKeyDown}
    >
      {/* Exact MediPro Window styling matching Image 1 */}
      <div className="w-[680px] max-w-[95vw] bg-[#f1f5f9] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800">
        {/* Title Bar */}
        <div className="bg-[#0f766e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300">🏢</span>
            <span>Select Company</span>
          </div>
          <button
            onClick={closeModal}
            className="w-4 h-4 bg-[#f1f5f9] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Function menu bar */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              onClick={() => setShowNewCompany(true)}
              className="underline cursor-pointer hover:bg-blue-100 px-1"
            >
              Function
            </span>
            <span onClick={closeModal} className="underline cursor-pointer hover:bg-blue-100 px-1">
              Exit
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Press F6 for New Company</span>
        </div>

        {/* Search input field (exact replica of Image 1) */}
        <div className="p-1.5 bg-[#f1f5f9] border-b border-slate-300">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type company name, code or ref code to filter..."
            className="w-full px-2 py-1 bg-white border border-slate-400 text-xs focus:outline-none focus:border-blue-600 font-medium text-slate-900 shadow-inner"
          />
        </div>

        {/* Data Grid matching Image 1 */}
        <div className="bg-white border border-slate-400 m-1.5 h-72 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Loading companies from database...</div>
          ) : error ? (
            <div className="p-4 text-center text-rose-600 text-xs">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead className="bg-[#f1f5f9] sticky top-0 border-b border-slate-400 text-slate-800 font-semibold select-none z-10">
                <tr>
                  <th className="w-5 py-1 px-1 border-r border-slate-300"></th>
                  <th className="py-1 px-2 border-r border-slate-300 w-16 text-right">CompCode</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-16">Ref Code</th>
                  <th className="py-1 px-2 border-r border-slate-300">Company Name</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-14 text-center">NcBill</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-16 text-center">SuperStock</th>
                  <th className="py-1 px-2 border-r border-slate-300 w-14 text-right">Custom</th>
                  <th className="py-1 px-2 w-14 text-center">NcTrade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-slate-400">
                      No companies match "{search}"
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((c, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <tr
                        key={c._id || c.compCode}
                        onClick={() => setSelectedIndex(index)}
                        onDoubleClick={() => handleSelect(c)}
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
                        <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono">
                          {c.compCode}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-mono font-semibold">
                          {c.refCode}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 font-semibold truncate max-w-[200px]">
                          {c.companyName}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 text-center font-mono">
                          {c.ncBill ? 'True' : 'False'}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 text-center font-mono">
                          {c.superStock ? 'True' : 'False'}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono">
                          {c.custom}
                        </td>
                        <td className="py-0.5 px-2 text-center font-mono">
                          {c.ncTrade ? 'True' : 'False'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Status / Hotkey bar matching Image 1 */}
        <div className="bg-[#f1f5f9] border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] font-sans">
          <span className="font-semibold text-slate-700">
            Press F6 - For New Company Coding
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (filteredCompanies[selectedIndex]) {
                  handleSelect(filteredCompanies[selectedIndex]);
                }
              }}
              className="px-3 py-0.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 text-[11px] rounded-xs shadow-xs"
            >
              Select (Enter)
            </button>
            <button
              onClick={closeModal}
              className="px-3 py-0.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 text-[11px] rounded-xs shadow-xs"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      </div>

      {/* New Company Coding Modal (F6) */}
      {showNewCompany && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 select-none">
          <div className="w-96 bg-[#f1f5f9] border-2 border-slate-700 shadow-2xl p-4 text-xs">
            <div className="bg-[#0f766e] text-white px-2 py-1 -m-4 mb-3 font-bold flex items-center justify-between">
              <span>New Company Coding (F6)</span>
              <button
                onClick={() => setShowNewCompany(false)}
                className="w-4 h-4 bg-[#f1f5f9] text-slate-900 flex items-center justify-center text-xs font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCompany} className="space-y-2 mt-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700">Company Code (Auto or Enter)</label>
                <input
                  type="number"
                  value={newCompanyForm.compCode}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, compCode: e.target.value })}
                  placeholder="Auto-assigned if empty"
                  className="w-full px-2 py-1 bg-white border border-slate-400 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700">Ref Code (e.g. LI, @M)</label>
                <input
                  type="text"
                  value={newCompanyForm.refCode}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, refCode: e.target.value })}
                  placeholder="e.g. LI"
                  className="w-full px-2 py-1 bg-white border border-slate-400 text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompanyForm.companyName}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, companyName: e.target.value })}
                  placeholder="e.g. ABBOTT LABORATORIES"
                  className="w-full px-2 py-1 bg-white border border-slate-400 text-xs font-semibold uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-600">Custom (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCompanyForm.custom}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, custom: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-white border border-slate-400 text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCompanyForm.ncBill}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, ncBill: e.target.checked })}
                    />
                    <span>NcBill (True)</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => setShowNewCompany(false)}
                  className="px-3 py-1 bg-[#dcdcdc] border border-slate-500 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#0f766e] text-white border border-blue-900 text-xs font-bold"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
