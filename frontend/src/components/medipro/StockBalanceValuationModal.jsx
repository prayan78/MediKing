import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DEFAULT_STOCK_ITEMS = [
  { isGroup: true, mdCode: '395', productName: '3M', unit: '', qty: '', amount: '' },
  { mdCode: '18342', productName: 'ABDOMINAL SUPPORT BELT', unit: 'PIC', qty: 7, amount: 4270.0 },
  { mdCode: '18238', productName: 'ACROLIN 4 TAB', unit: 'TAB', qty: 5420, amount: 0.0 },
  { mdCode: '18295', productName: 'ACTICET 50ML', unit: 'PH', qty: 41, amount: 815.49 },
  { mdCode: '18243', productName: 'ADOXY 100MG', unit: 'CAP', qty: 100, amount: 0.0 },
  { mdCode: '17728', productName: 'ADULT DIPER', unit: 'PCS', qty: 33, amount: 2970.0 },
  { mdCode: '17686', productName: 'ALBENDAZOLE SYR.', unit: 'PH', qty: 32, amount: 528.0 },
  { mdCode: '17781', productName: 'ALERSEF SYR', unit: 'PH', qty: 77, amount: 3982.44 },
  { mdCode: '17785', productName: 'ALFAPRO-0.4 TAB', unit: 'TAB', qty: 116, amount: 1566.0 },
  { mdCode: '17593', productName: 'AMLOD 5MG', unit: 'TAB', qty: -5, amount: -35.75 },
  { mdCode: '18216', productName: 'AMLYCURE DS CAP', unit: 'CAP', qty: 960, amount: 9936.0 },
  { mdCode: '18240', productName: 'AMOXYCILLIN DT 250', unit: 'TAB', qty: 850, amount: 0.0 },
  { mdCode: '18327', productName: 'ANKLE SUPPORT', unit: 'PIC', qty: 7, amount: 2520.0 },
  { mdCode: '18324', productName: 'ANKLE SUPPORT WITH BINDER', unit: 'PIC', qty: 5, amount: 2400.0 },
  { mdCode: '18361', productName: 'APABALIN 75 CAP', unit: 'CAP', qty: 610, amount: 6832.0 },
  { mdCode: '18215', productName: 'APTIBOOM SYRUP 200ML', unit: 'PH', qty: 10, amount: 1510.0 },
  { mdCode: '18109', productName: 'ARCETRIN TAB', unit: 'TAB', qty: 3377, amount: 10198.54 },
  { mdCode: '17967', productName: 'ARCLOX CAP', unit: 'CAP', qty: 300, amount: 0.0 },
  { mdCode: '18045', productName: 'ARDOXIM 200DT', unit: 'TAB', qty: 6, amount: 129.3 },
  { mdCode: '18042', productName: 'ARHEX GARGLE', unit: 'PH', qty: 126, amount: 8694.0 },
  { mdCode: '17692', productName: 'ARM SLING', unit: 'PIC', qty: 2, amount: 830.0 },
  { mdCode: '18277', productName: 'ARMETRO SUSP', unit: 'PH', qty: 39, amount: 0.0 },
  { mdCode: '18274', productName: 'ARMETRO TAB', unit: 'TAB', qty: 390, amount: 0.0 },
  { mdCode: '18205', productName: 'ARNIMES TAB', unit: 'TAB', qty: 4630, amount: 11991.7 },
  { mdCode: '18311', productName: 'AROZIN 500', unit: 'TAB', qty: 2236, amount: 57979.48 },
];

export default function StockBalanceValuationModal({
  isOpen,
  onClose,
  initialDate = '2078/05/14',
}) {
  const [stockItems, setStockItems] = useState(DEFAULT_STOCK_ITEMS);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filters from Image 4
  const [uptoDate, setUptoDate] = useState(initialDate);
  const [priceType, setPriceType] = useState('C_Price');
  const [batchCheck, setBatchCheck] = useState(false);
  const [expiryCheck, setExpiryCheck] = useState(false);
  const [priceCheck, setPriceCheck] = useState(false);
  const [mrpCheck, setMrpCheck] = useState(false);
  const [purchInfoCheck, setPurchInfoCheck] = useState(false);

  const [companyCode, setCompanyCode] = useState('0');
  const [companyName, setCompanyName] = useState('');
  const [divisionCode, setDivisionCode] = useState('0');
  const [divisionName, setDivisionName] = useState('');
  const [orderBy, setOrderBy] = useState('Name');
  const [setupPrice, setSetupPrice] = useState(false);
  const [store, setStore] = useState('-- All Store --');

  // Try loading real products from API if available to merge
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    api
      .get('/products?limit=100')
      .then((res) => {
        if (!isMounted) return;
        const dbProducts = res.data?.data || [];
        if (dbProducts.length > 0) {
          // Format DB products into table format
          const formattedDbItems = dbProducts.map((p) => {
            const qty = p.safetyStock || p.inBox || 0;
            const price = priceType === 'C_Price' ? p.cPrice : p.sPrice;
            return {
              mdCode: String(p.mdCode || ''),
              productName: p.brandName || '',
              unit: p.unit || 'TAB',
              qty: qty,
              amount: qty * (price || 0),
            };
          });

          // Merge default items with unique DB products
          const existingCodes = new Set(DEFAULT_STOCK_ITEMS.map((d) => d.mdCode));
          const additions = formattedDbItems.filter((item) => !existingCodes.has(item.mdCode));
          setStockItems([...DEFAULT_STOCK_ITEMS, ...additions]);
        }
      })
      .catch((err) => {
        // Fallback to DEFAULT_STOCK_ITEMS which is faithful to Image 4
        console.warn('Using default stock balance records:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, priceType]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, stockItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stockItems.length, onClose]);

  if (!isOpen) return null;

  // Sorting
  const sortedItems = [...stockItems].sort((a, b) => {
    if (a.isGroup) return -1;
    if (b.isGroup) return 1;
    if (orderBy === 'Name') {
      return a.productName.localeCompare(b.productName);
    } else if (orderBy === 'Code') {
      return Number(a.mdCode) - Number(b.mdCode);
    }
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 4 */}
      <div className="w-[1050px] max-w-[98vw] max-h-[96vh] bg-[#ece9d8] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#2b4c7e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <span>Stock Balance At</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
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
          <span className="text-[10px] text-slate-500 font-mono">MediKing Inventory Management</span>
        </div>

        {/* Toolbar / Filters Area (Image 4) */}
        <div className="p-2 bg-[#ece9d8] border-b border-slate-300 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Left filter group */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="px-2.5 py-0.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-[#0055ea] font-bold text-[#0055ea] rounded-xs shadow-xs text-xs"
              >
                Upto Date
              </button>

              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700">Upto</span>
                <input
                  type="text"
                  value={uptoDate}
                  onChange={(e) => setUptoDate(e.target.value)}
                  className="w-24 bg-white border border-slate-400 px-1.5 py-0.5 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700">Price</span>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="bg-white border border-slate-400 px-1.5 py-0.5 text-xs font-sans"
                >
                  <option value="C_Price">C_Price</option>
                  <option value="S_Price">S_Price</option>
                  <option value="I_Price">I_Price</option>
                  <option value="MRP">MRP</option>
                </select>
              </div>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={batchCheck}
                  onChange={(e) => setBatchCheck(e.target.checked)}
                  className="accent-blue-700"
                />
                <span>Batch</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expiryCheck}
                  onChange={(e) => setExpiryCheck(e.target.checked)}
                  className="accent-blue-700"
                />
                <span>Expiry</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priceCheck}
                  onChange={(e) => setPriceCheck(e.target.checked)}
                  className="accent-blue-700"
                />
                <span>Price</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mrpCheck}
                  onChange={(e) => setMrpCheck(e.target.checked)}
                  className="accent-blue-700"
                />
                <span>MRP</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={purchInfoCheck}
                  onChange={(e) => setPurchInfoCheck(e.target.checked)}
                  className="accent-blue-700"
                />
                <span>Purch Info</span>
              </label>
            </div>

            {/* Right filter group */}
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="w-16 text-slate-700 font-semibold">Company</span>
                <input
                  type="text"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="w-12 bg-white border border-slate-400 px-1 py-0.5 text-center font-mono text-xs"
                />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-48 bg-white border border-slate-400 px-1.5 py-0.5 text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="w-16 text-slate-700 font-semibold">Division</span>
                <input
                  type="text"
                  value={divisionCode}
                  onChange={(e) => setDivisionCode(e.target.value)}
                  className="w-12 bg-white border border-slate-400 px-1 py-0.5 text-center font-mono text-xs"
                />
                <input
                  type="text"
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  className="w-48 bg-white border border-slate-400 px-1.5 py-0.5 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-16 text-slate-700 font-semibold">Order By</span>
                  <select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="w-24 bg-white border border-slate-400 px-1 py-0.5 text-xs"
                  >
                    <option value="Name">Name</option>
                    <option value="Code">Code</option>
                  </select>
                </div>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setupPrice}
                    onChange={(e) => setSetupPrice(e.target.checked)}
                    className="accent-blue-700"
                  />
                  <span>Setup Price</span>
                </label>

                <div className="flex items-center gap-1">
                  <span className="text-slate-700 font-semibold">Store</span>
                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-28 bg-white border border-slate-400 px-1 py-0.5 text-xs"
                  >
                    <option value="-- All Store --">-- All Store --</option>
                    <option value="Main Store">Main Store</option>
                    <option value="Emergency Store">Emergency Store</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table (Exact representation of Image 4) */}
        <div className="flex-1 bg-white overflow-auto border-t border-slate-400">
          <table className="w-full text-left text-xs font-sans border-collapse border-b border-slate-300">
            <thead className="bg-[#e4e1d1] sticky top-0 border-b border-slate-400 text-slate-900 select-none z-10">
              <tr>
                <th className="w-6 p-1 border-r border-slate-300 text-center"></th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold w-24">Md Code</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold">Product Name</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold w-20">Unit</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold w-24 text-right">Qty</th>
                <th className="p-1 px-2 border-r border-slate-300 font-semibold w-32 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const isNegative = typeof item.qty === 'number' && item.qty < 0;

                if (item.isGroup) {
                  return (
                    <tr
                      key={`grp-${idx}`}
                      onClick={() => setSelectedIndex(idx)}
                      className={`cursor-pointer ${
                        isSelected ? 'bg-[#316ac5] text-white font-bold' : 'bg-slate-50 font-bold text-slate-900'
                      }`}
                    >
                      <td className="p-0.5 text-center text-[10px]">
                        {isSelected ? '▶' : ''}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200">{item.mdCode}</td>
                      <td className="p-1 px-2 border-r border-slate-200" colSpan={4}>
                        {item.productName}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={`prod-${item.mdCode}-${idx}`}
                    onClick={() => setSelectedIndex(idx)}
                    className={`cursor-pointer transition-colors border-b border-slate-100 ${
                      isSelected
                        ? 'bg-[#316ac5] text-white'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-blue-50'
                        : 'bg-[#fbfbfb] hover:bg-blue-50'
                    }`}
                  >
                    <td className="p-0.5 text-center text-[10px]">
                      {isSelected ? '▶' : ''}
                    </td>
                    <td
                      className={`p-1 px-2 border-r border-slate-200 font-mono text-xs ${
                        isSelected ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {item.mdCode}
                    </td>
                    <td className="p-1 px-2 border-r border-slate-200 font-medium">
                      {item.productName}
                    </td>
                    <td
                      className={`p-1 px-2 border-r border-slate-200 text-xs ${
                        isSelected
                          ? 'text-white'
                          : isNegative
                          ? 'text-amber-800 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.unit}
                    </td>
                    <td
                      className={`p-1 px-2 border-r border-slate-200 font-mono text-right ${
                        isSelected
                          ? 'text-white'
                          : isNegative
                          ? 'text-[#b34700] font-semibold'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.qty}
                    </td>
                    <td
                      className={`p-1 px-2 border-r border-slate-200 font-mono text-right ${
                        isSelected
                          ? 'text-white'
                          : isNegative
                          ? 'text-[#b34700] font-semibold'
                          : 'text-slate-900'
                      }`}
                    >
                      {typeof item.amount === 'number'
                        ? item.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : item.amount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#ece9d8] border-t border-slate-300 px-3 py-1 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              Total Items:{' '}
              <strong className="text-slate-900">
                {stockItems.filter((i) => !i.isGroup).length}
              </strong>
            </span>
            <span>
              Total Valuation:{' '}
              <strong className="text-blue-900 font-mono">
                Rs.{' '}
                {stockItems
                  .filter((i) => !i.isGroup && typeof i.amount === 'number')
                  .reduce((sum, i) => sum + i.amount, 0)
                  .toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </strong>
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Press <kbd className="px-1 py-0.5 bg-slate-200 rounded border">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-200 rounded border">↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-slate-200 rounded border">Esc</kbd> to Exit
          </div>
        </div>
      </div>
    </div>
  );
}

