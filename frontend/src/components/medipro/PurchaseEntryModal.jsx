import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getBikramSambatDate } from '../../utils/nepaliDate';

export default function PurchaseEntryModal({ isOpen, onClose, onPurchaseCreated }) {
  const [fiscalYear, setFiscalYear] = useState('FY7879');
  const [mrnNo, setMrnNo] = useState('FAPU0000003');
  const [purchDateAd, setPurchDateAd] = useState(new Date().toISOString().split('T')[0]);
  const [purchDateBs, setPurchDateBs] = useState(() => getBikramSambatDate(new Date()).formatted);
  const [vatType, setVatType] = useState('Inclusive');
  const [discountOn, setDiscountOn] = useState('After CC');
  const [ccChargeType, setCcChargeType] = useState('Inclusive');
  const [companywisePurchase, setCompanywisePurchase] = useState('NO');
  const [discountType, setDiscountType] = useState('Invoicewise');
  const [ccFreeExclude, setCcFreeExclude] = useState(false);
  const [vatOnFreeActive, setVatOnFreeActive] = useState(false);

  const [division, setDivision] = useState('0');
  const [lessCustom, setLessCustom] = useState('N');
  const [cashParty, setCashParty] = useState('N');
  const [manualMrn, setManualMrn] = useState('');
  const [marginText, setMarginText] = useState('');

  const [supplierCode, setSupplierCode] = useState('SUP-002');
  const [supplierName, setSupplierName] = useState('BANEPA MEDISTORE');
  const [billNo, setBillNo] = useState('ABC001');
  const [billDateAd, setBillDateAd] = useState('2021-08-17');
  const [billDateBs, setBillDateBs] = useState('2078/05/01');
  const [stockistPurchase, setStockistPurchase] = useState(false);

  // Available medicines for dropdown
  const [medicines, setMedicines] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Items in Purchase
  const [items, setItems] = useState([
    {
      mdCode: 17625,
      particular: 'TRYOCORT INJ',
      wsunit: 'VIAL',
      pack: '1',
      batch: 'TR-9921',
      expiry: '2026/08/29',
      qty: 10,
      free: 0,
      totalQty: 10,
      iPrice: 105.0,
      net: 1050.0,
      sPrice: 120.0,
      margin: 14.28,
      mrp: 120.0,
    },
    {
      mdCode: 17234,
      particular: '1000-D CAP.',
      wsunit: 'CAP',
      pack: '10X10',
      batch: 'KD-112',
      expiry: '2026/05/15',
      qty: 10,
      free: 0,
      totalQty: 10,
      iPrice: 15.8,
      net: 158.0,
      sPrice: 17.0,
      margin: 7.5,
      mrp: 170.0,
    },
  ]);

  // Current row being edited/added
  const [currentItem, setCurrentItem] = useState({
    mdCode: '',
    particular: '',
    wsunit: 'TAB',
    pack: '10X10',
    batch: '',
    expiry: '2026/12/31',
    qty: 1,
    free: 0,
    totalQty: 1,
    iPrice: 0,
    net: 0,
    sPrice: 0,
    margin: 0,
    mrp: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNextMrn();
      fetchMedicines();
    }
  }, [isOpen]);

  const fetchNextMrn = async () => {
    try {
      const res = await api.get('/purchases/next-mrn');
      if (res.data.nextMrn) setMrnNo(res.data.nextMrn);
    } catch (e) {
      console.warn('Using default MRN');
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setMedicines(res.data.data || []);
    } catch (e) {
      console.error('Failed to load medicines:', e);
    }
  };

  const handleProductSelect = (mdCode) => {
    const med = medicines.find((m) => m.mdCode === Number(mdCode));
    if (med) {
      setSelectedProduct(med);
      const iPrice = med.cPrice || med.sPrice * 0.85 || 10;
      const sPrice = med.sPrice || 12;
      const margin = sPrice > 0 ? (((sPrice - iPrice) / sPrice) * 100).toFixed(2) : 0;
      setCurrentItem({
        mdCode: med.mdCode,
        particular: med.brandName,
        wsunit: med.unit || 'TAB',
        pack: med.packing || '1',
        batch: `BAT-${Math.floor(100 + Math.random() * 900)}`,
        expiry: '2027/06/30',
        qty: 10,
        free: 0,
        totalQty: 10,
        iPrice: Number(iPrice),
        net: Number(iPrice) * 10,
        sPrice: Number(sPrice),
        margin: Number(margin),
        mrp: Number(med.mrp || sPrice),
      });
    }
  };

  const handleCurrentItemChange = (field, val) => {
    const updated = { ...currentItem, [field]: val };
    const qty = Number(field === 'qty' ? val : updated.qty) || 0;
    const free = Number(field === 'free' ? val : updated.free) || 0;
    const iPrice = Number(field === 'iPrice' ? val : updated.iPrice) || 0;
    const sPrice = Number(field === 'sPrice' ? val : updated.sPrice) || 0;

    updated.totalQty = qty + free;
    updated.net = Number((qty * iPrice).toFixed(2));
    if (sPrice > 0 && iPrice > 0) {
      updated.margin = Number((((sPrice - iPrice) / sPrice) * 100).toFixed(2));
    }
    setCurrentItem(updated);
  };

  const handleAddItem = () => {
    if (!currentItem.particular || !currentItem.qty) {
      alert('Please select a medicine and specify quantity');
      return;
    }
    setItems([...items, currentItem]);
    setCurrentItem({
      mdCode: '',
      particular: '',
      wsunit: 'TAB',
      pack: '10X10',
      batch: '',
      expiry: '2026/12/31',
      qty: 1,
      free: 0,
      totalQty: 1,
      iPrice: 0,
      net: 0,
      sPrice: 0,
      margin: 0,
      mrp: 0,
    });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.net) || 0), 0);

  const handlePostPurchase = async () => {
    if (items.length === 0) {
      alert('Please add at least one medicine item to the purchase entry');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        mrnNo,
        fiscalYear,
        purchDateAd,
        purchDateBs,
        billNo,
        billDateAd,
        billDateBs,
        supplierCode,
        supplierName,
        division,
        vatType,
        discountOn,
        ccChargeType,
        companywisePurchase,
        discountType,
        ccFreeExclude,
        vatOnFreeActive,
        lessCustom,
        cashParty,
        manualMrn,
        stockistPurchase,
        items,
        totalAmount,
        netAmount: totalAmount,
      };

      const res = await api.post('/purchases', payload);
      if (res.data.success) {
        alert(`Purchase ${res.data.data.mrnNo} successfully POSTED to inventory!`);
        if (onPurchaseCreated) onPurchaseCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to post purchase:', err);
      setError(err.response?.data?.message || 'Failed to post purchase to database');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 select-none font-sans">
      {/* Exact MediPro Purchase Entry Window (Image 3) */}
      <div className="w-[1020px] max-w-[98vw] max-h-[96vh] bg-[#ece9d8] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#2b4c7e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300">📦</span>
            <span>Purchase Entry</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Menu Strip */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold">Function</span>
            <span onClick={onClose} className="underline cursor-pointer hover:bg-blue-100 px-1">Exit</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">MediKing Pharmacy Material Receipt</span>
        </div>

        {error && (
          <div className="bg-rose-100 border-b border-rose-300 px-3 py-1 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Top Header Form Controls (Exact replica of Image 3) */}
        <div className="p-2 space-y-1 bg-[#ece9d8] border-b border-slate-300 text-[11px]">
          {/* Row 1: Fiscal Year, MRN, Dates, Taxes & Discounts */}
          <div className="grid grid-cols-12 gap-1.5 items-center">
            <div className="col-span-1 font-bold text-slate-800">Fiscal Year</div>
            <div className="col-span-1">
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
              >
                <option value="FY7879">FY7879</option>
                <option value="FY8081">FY8081</option>
                <option value="FY8182">FY8182</option>
              </select>
            </div>

            <div className="col-span-1 font-bold text-right text-slate-800">MRN No.</div>
            <div className="col-span-1">
              <input
                type="text"
                value={mrnNo}
                onChange={(e) => setMrnNo(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5 font-mono font-bold text-blue-900"
              />
            </div>

            <div className="col-span-1 font-bold text-right text-slate-800">Purch. Date</div>
            <div className="col-span-3 flex items-center gap-1">
              <input
                type="date"
                value={purchDateAd}
                onChange={(e) => {
                  setPurchDateAd(e.target.value);
                  setPurchDateBs(getBikramSambatDate(new Date(e.target.value)).formatted);
                }}
                className="w-28 bg-white border border-slate-400 px-1 py-0.5 font-mono text-[10px]"
              />
              <span className="font-mono text-slate-500 text-[10px] bg-slate-200 px-1 border border-slate-300">
                {purchDateBs}
              </span>
            </div>

            <div className="col-span-1 font-semibold text-right">Vat</div>
            <div className="col-span-1">
              <select
                value={vatType}
                onChange={(e) => setVatType(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="Inclusive">Inclusive</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>

            <div className="col-span-1 font-semibold text-right">Discount On</div>
            <div className="col-span-1">
              <select
                value={discountOn}
                onChange={(e) => setDiscountOn(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="After CC">After CC</option>
                <option value="Before CC">Before CC</option>
              </select>
            </div>
          </div>

          {/* Row 2: CC Charge, Companywise, Discount Type & Flags */}
          <div className="grid grid-cols-12 gap-1.5 items-center">
            <div className="col-span-1 font-semibold">C.C. Charge</div>
            <div className="col-span-1">
              <select
                value={ccChargeType}
                onChange={(e) => setCcChargeType(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="Inclusive">Inclusive</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>

            <div className="col-span-2 font-semibold text-right">Companywise Purch.</div>
            <div className="col-span-1">
              <select
                value={companywisePurchase}
                onChange={(e) => setCompanywisePurchase(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div className="col-span-1 font-semibold text-right">Discount</div>
            <div className="col-span-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="Invoicewise">Invoicewise</option>
                <option value="Itemwise">Itemwise</option>
              </select>
            </div>

            <div className="col-span-5 flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ccFreeExclude}
                  onChange={(e) => setCcFreeExclude(e.target.checked)}
                />
                <span>CC Free Exclude</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vatOnFreeActive}
                  onChange={(e) => setVatOnFreeActive(e.target.checked)}
                />
                <span>VAT On Free Active</span>
              </label>
            </div>
          </div>

          {/* Row 3: Division, Less Custom, Cash Party, Margin */}
          <div className="grid grid-cols-12 gap-1.5 items-center">
            <div className="col-span-1 font-semibold">Division</div>
            <div className="col-span-1">
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5 font-mono"
              />
            </div>

            <div className="col-span-2 font-semibold text-right">Less Custom 0.5</div>
            <div className="col-span-1">
              <select
                value={lessCustom}
                onChange={(e) => setLessCustom(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="N">N</option>
                <option value="Y">Y</option>
              </select>
            </div>

            <div className="col-span-1 font-semibold text-right">Cash Party</div>
            <div className="col-span-1">
              <select
                value={cashParty}
                onChange={(e) => setCashParty(e.target.value)}
                className="w-full bg-blue-900 text-white font-bold border border-slate-400 px-1 py-0.5"
              >
                <option value="N">N</option>
                <option value="Y">Y</option>
              </select>
            </div>

            <div className="col-span-2 font-semibold text-right">Manual MRN</div>
            <div className="col-span-2">
              <input
                type="text"
                value={manualMrn}
                onChange={(e) => setManualMrn(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              />
            </div>

            <div className="col-span-2 font-bold text-blue-900 text-right">Margin : {marginText || '0.00%'}</div>
          </div>

          {/* Row 4: Supplier, Bill No, Bill Date, Count, Stockist */}
          <div className="grid grid-cols-12 gap-1.5 items-center pt-1 border-t border-slate-300">
            <div className="col-span-1 font-bold text-slate-800">Supplier</div>
            <div className="col-span-4 flex items-center gap-1">
              <input
                type="text"
                value={supplierCode}
                onChange={(e) => setSupplierCode(e.target.value)}
                className="w-16 bg-white border border-slate-400 px-1 py-0.5 font-mono"
                placeholder="Code"
              />
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="flex-1 bg-white border border-slate-400 px-1 py-0.5 font-bold uppercase text-slate-900"
                placeholder="Supplier Name"
              />
            </div>

            <div className="col-span-1 font-bold text-right text-slate-800">Bill No.</div>
            <div className="col-span-2">
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5 font-mono font-bold"
              />
            </div>

            <div className="col-span-1 font-bold text-right text-slate-800">Bill Date</div>
            <div className="col-span-3 flex items-center gap-1">
              <input
                type="date"
                value={billDateAd}
                onChange={(e) => {
                  setBillDateAd(e.target.value);
                  setBillDateBs(getBikramSambatDate(new Date(e.target.value)).formatted);
                }}
                className="w-28 bg-white border border-slate-400 px-1 py-0.5 font-mono text-[10px]"
              />
              <span className="font-mono text-slate-500 text-[10px] bg-slate-200 px-1 border border-slate-300">
                {billDateBs}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Line Row */}
        <div className="bg-[#f5f5f0] border-b border-slate-300 p-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-bold text-blue-900">Add Item:</span>
          <select
            value={currentItem.mdCode}
            onChange={(e) => handleProductSelect(e.target.value)}
            className="w-56 bg-white border border-slate-400 px-1 py-0.5 font-semibold text-xs"
          >
            <option value="">-- Select Standard Medicine --</option>
            {medicines.map((m) => (
              <option key={m.mdCode} value={m.mdCode}>
                {m.mdCode} - {m.brandName} ({m.dosageForm || 'Tab'})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Batch No."
            value={currentItem.batch}
            onChange={(e) => handleCurrentItemChange('batch', e.target.value)}
            className="w-20 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs uppercase"
          />

          <input
            type="text"
            placeholder="Expiry (YYYY/MM/DD)"
            value={currentItem.expiry}
            onChange={(e) => handleCurrentItemChange('expiry', e.target.value)}
            className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
          />

          <div className="flex items-center gap-1">
            <span className="text-slate-600">Qty:</span>
            <input
              type="number"
              value={currentItem.qty}
              onChange={(e) => handleCurrentItemChange('qty', e.target.value)}
              className="w-12 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs font-bold"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-600">Free:</span>
            <input
              type="number"
              value={currentItem.free}
              onChange={(e) => handleCurrentItemChange('free', e.target.value)}
              className="w-10 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-600">Cost (I_Price):</span>
            <input
              type="number"
              step="0.01"
              value={currentItem.iPrice}
              onChange={(e) => handleCurrentItemChange('iPrice', e.target.value)}
              className="w-16 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-600">S_Price:</span>
            <input
              type="number"
              step="0.01"
              value={currentItem.sPrice}
              onChange={(e) => handleCurrentItemChange('sPrice', e.target.value)}
              className="w-16 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs font-bold text-emerald-800"
            />
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-0.5 bg-[#316ac5] text-white font-bold rounded-xs hover:bg-blue-700 shadow-xs"
          >
            + Add Row
          </button>
        </div>

        {/* High Density Table Grid (Exact replica of Image 3) */}
        <div className="flex-1 bg-white border-b border-slate-400 overflow-y-auto min-h-[220px]">
          <table className="w-full text-left border-collapse text-[11px] font-sans">
            <thead className="bg-[#ece9d8] sticky top-0 border-b border-slate-400 text-slate-800 font-semibold select-none z-10">
              <tr>
                <th className="w-5 py-1 px-1 border-r border-slate-300"></th>
                <th className="py-1 px-2 border-r border-slate-300 w-16">Md Code</th>
                <th className="py-1 px-2 border-r border-slate-300">Particular</th>
                <th className="py-1 px-1 border-r border-slate-300 w-14">Wsunit</th>
                <th className="py-1 px-1 border-r border-slate-300 w-12">Pack</th>
                <th className="py-1 px-2 border-r border-slate-300 w-20">Batch</th>
                <th className="py-1 px-2 border-r border-slate-300 w-20">Expiry</th>
                <th className="py-1 px-1 border-r border-slate-300 w-12 text-right">Qty</th>
                <th className="py-1 px-1 border-r border-slate-300 w-10 text-right">Free</th>
                <th className="py-1 px-1 border-r border-slate-300 w-14 text-right">Total Qty</th>
                <th className="py-1 px-2 border-r border-slate-300 w-16 text-right">I Price</th>
                <th className="py-1 px-2 border-r border-slate-300 w-16 text-right font-bold">Net</th>
                <th className="py-1 px-2 border-r border-slate-300 w-16 text-right">S Price</th>
                <th className="py-1 px-1 border-r border-slate-300 w-12 text-right">Margin</th>
                <th className="py-1 px-2 border-r border-slate-300 w-16 text-right">mrp</th>
                <th className="py-1 px-1 w-8 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="16" className="p-8 text-center text-slate-400 italic">
                    No items entered in this purchase bill. Select a medicine above and click "+ Add Row".
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-[#fbfbf9] hover:bg-blue-50'}
                  >
                    <td className="py-0.5 px-1 text-center border-r border-slate-200">
                      <span className="text-[9px] text-blue-700">▶</span>
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 font-mono text-slate-800">
                      {it.mdCode}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 font-bold text-slate-900 truncate max-w-[200px]">
                      {it.particular}
                    </td>
                    <td className="py-0.5 px-1 border-r border-slate-200 font-mono text-[10px]">
                      {it.wsunit}
                    </td>
                    <td className="py-0.5 px-1 border-r border-slate-200 font-mono text-[10px]">
                      {it.pack}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 font-mono font-semibold text-slate-700">
                      {it.batch}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 font-mono text-[10px]">
                      {it.expiry}
                    </td>
                    <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono font-bold">
                      {it.qty}
                    </td>
                    <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono">
                      {it.free}
                    </td>
                    <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono font-bold text-blue-900">
                      {it.totalQty}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono">
                      {Number(it.iPrice).toFixed(2)}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {Number(it.net).toFixed(2)}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono text-emerald-800">
                      {Number(it.sPrice).toFixed(2)}
                    </td>
                    <td className="py-0.5 px-1 border-r border-slate-200 text-right font-mono text-[10px]">
                      {it.margin}%
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-200 text-right font-mono font-semibold">
                      {Number(it.mrp).toFixed(2)}
                    </td>
                    <td className="py-0.5 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-600 hover:text-rose-900 font-bold px-1"
                        title="Delete line"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Status & Posting Buttons (Exact styling of Image 3) */}
        <div className="bg-[#ece9d8] border-t border-slate-300 p-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700">Stock: {items.length} items</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Purchase Post (The iconic pink/red button from Image 3) */}
            <button
              type="button"
              onClick={handlePostPurchase}
              disabled={saving}
              className="px-6 py-1.5 bg-gradient-to-b from-[#e57373] to-[#c62828] hover:from-[#ef5350] hover:to-[#b71c1c] text-white font-bold rounded-xs border border-red-900 shadow-md active:translate-y-0.5 disabled:opacity-50 text-xs tracking-wide"
            >
              {saving ? 'Posting Purchase...' : 'Purchase Post'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] hover:from-white hover:to-[#cecece] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Total Amount:</span>
            <div className="px-3 py-1 bg-white border border-slate-400 font-mono font-extrabold text-sm text-slate-900 w-32 text-right">
              Rs. {totalAmount.toFixed(2)}
            </div>
            <span className="font-medium text-slate-600 ml-2">Bonus</span>
          </div>
        </div>
      </div>
    </div>
  );
}

