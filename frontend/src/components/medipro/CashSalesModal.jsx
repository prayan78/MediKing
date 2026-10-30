import React, { useState, useEffect, useRef } from 'react';
import DiscountSettlementModal from './DiscountSettlementModal';
import api from '../../services/api';

const SAMPLE_PRODUCTS = [
  { mdCode: '14759', brandName: 'LEVOCET-5MG', unit: 'TAB', wsUnit: 1, sPrice: 6.4, stock: 100 },
  { mdCode: '18342', brandName: 'ABDOMINAL SUPPORT BELT', unit: 'PIC', wsUnit: 1, sPrice: 610.0, stock: 7 },
  { mdCode: '18238', brandName: 'ACROLIN 4 TAB', unit: 'TAB', wsUnit: 1, sPrice: 12.5, stock: 5420 },
  { mdCode: '18295', brandName: 'ACTICET 50ML', unit: 'PH', wsUnit: 1, sPrice: 24.5, stock: 41 },
  { mdCode: '18243', brandName: 'ADOXY 100MG', unit: 'CAP', wsUnit: 1, sPrice: 8.0, stock: 100 },
  { mdCode: '17728', brandName: 'ADULT DIPER', unit: 'PCS', wsUnit: 1, sPrice: 90.0, stock: 33 },
  { mdCode: '17593', brandName: 'AMLOD 5MG', unit: 'TAB', wsUnit: 1, sPrice: 4.5, stock: 250 },
  { mdCode: '18216', brandName: 'AMLYCURE DS CAP', unit: 'CAP', wsUnit: 1, sPrice: 15.0, stock: 960 },
  { mdCode: '18311', brandName: 'AROZIN 500', unit: 'TAB', wsUnit: 1, sPrice: 28.0, stock: 2236 },
];

export default function CashSalesModal({
  isOpen,
  onClose,
  isReturn = false,
  initialDateBs = '2078/05/14',
}) {
  // Mode & Radio States
  const [patientType, setPatientType] = useState('OPD'); // General, IPD, Member, OPD
  const [payMode, setPayMode] = useState('Cash'); // Cash, Credit
  const [memberId, setMemberId] = useState('11006');
  const [memberName, setMemberName] = useState('ARCHANA GIRI');
  const [partyCode, setPartyCode] = useState('1004');
  const [partyName, setPartyName] = useState('CASH SALES COUNTER');
  const [prescribeBy, setPrescribeBy] = useState('0');
  const [doctorName, setDoctorName] = useState('');
  const [oldBal, setOldBal] = useState(0.0);
  const [address, setAddress] = useState('');
  const [pan, setPan] = useState('');
  const [tel, setTel] = useState('');
  const [refCode, setRefCode] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [nshiNo, setNshiNo] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [insuranceProduct, setInsuranceProduct] = useState(false);

  // Table items
  const [items, setItems] = useState([]);
  const [selectedRow, setSelectedRow] = useState(0);

  // Current row input states (matching highlighted arrow in Image 2)
  const [inputMdCode, setInputMdCode] = useState('14759');
  const [inputParticular, setInputParticular] = useState('LEVOCET-5MG');
  const [inputWsUnit, setInputWsUnit] = useState('1');
  const [inputPack, setInputPack] = useState('TAB');
  const [inputQty, setInputQty] = useState('10');
  const [inputBonus, setInputBonus] = useState('0');
  const [inputRate, setInputRate] = useState('6.40');
  const [inputDiscPercent, setInputDiscPercent] = useState('0.00');

  // Discount & Settlement Modal State (Image 3)
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Focus ref for Qty input
  const qtyInputRef = useRef(null);
  const mdCodeInputRef = useRef(null);

  // Current product info display
  const [activeStock, setActiveStock] = useState(100);

  useEffect(() => {
    if (isOpen) {
      if (qtyInputRef.current) {
        qtyInputRef.current.focus();
        qtyInputRef.current.select();
      }
    }
  }, [isOpen]);

  // Handle MdCode / Particular change with auto-fill
  const handleMdCodeChange = (code) => {
    setInputMdCode(code);
    const found = SAMPLE_PRODUCTS.find((p) => p.mdCode === code);
    if (found) {
      setInputParticular(found.brandName);
      setInputPack(found.unit);
      setInputWsUnit(String(found.wsUnit || 1));
      setInputRate(found.sPrice.toFixed(2));
      setActiveStock(found.stock);
    }
  };

  const handleParticularChange = (name) => {
    setInputParticular(name);
    const found = SAMPLE_PRODUCTS.find(
      (p) => p.brandName.toLowerCase() === name.toLowerCase()
    );
    if (found) {
      setInputMdCode(found.mdCode);
      setInputPack(found.unit);
      setInputWsUnit(String(found.wsUnit || 1));
      setInputRate(found.sPrice.toFixed(2));
      setActiveStock(found.stock);
    }
  };

  // Calculated current row amount
  const qtyVal = Number(inputQty) || 0;
  const rateVal = Number(inputRate) || 0;
  const discVal = Number(inputDiscPercent) || 0;
  const currentAmount = qtyVal * rateVal * (1 - discVal / 100);

  // Add Item to Table on ENTER key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleAddItem = () => {
    if (!inputParticular.trim() || qtyVal === 0) {
      alert('Please enter a valid product name and quantity.');
      return;
    }

    const newItem = {
      serial: items.length + 1,
      mdCode: inputMdCode,
      particular: inputParticular,
      wsUnit: inputWsUnit,
      pack: inputPack,
      qty: isReturn ? -Math.abs(qtyVal) : qtyVal,
      bonus: Number(inputBonus) || 0,
      rate: rateVal,
      discPercent: discVal,
      amount: isReturn ? -Math.abs(currentAmount) : currentAmount,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset inputs for next entry
    setInputMdCode('');
    setInputParticular('');
    setInputWsUnit('1');
    setInputPack('TAB');
    setInputQty('0');
    setInputBonus('0');
    setInputRate('0.00');
    setInputDiscPercent('0.00');

    if (mdCodeInputRef.current) {
      mdCodeInputRef.current.focus();
    }
  };

  // Total amount calculation
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleEmptyRecord = () => {
    if (window.confirm('Clear all entered sales items?')) {
      setItems([]);
    }
  };

  const handlePostSale = () => {
    if (items.length === 0) {
      alert('Please add at least one item before posting.');
      return;
    }
    // Open settlement modal first if discount not settled
    setSettlementOpen(true);
  };

  const handleCompletePost = (settlementData) => {
    alert(
      `${isReturn ? 'Sales Return' : 'Cash Sales'} Posted Successfully!\nInvoice Total: Rs. ${(
        settlementData?.netTotal || totalAmount
      ).toFixed(2)}\nTender: Rs. ${settlementData?.tender || totalAmount}`
    );
    setItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 2 */}
      <div className="w-[1150px] max-w-[98vw] max-h-[96vh] bg-[#f1f5f9] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#0f766e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300">💻</span>
            <span>{isReturn ? 'CASH SALES RETURN' : 'CASH SALES'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#f1f5f9] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Function Strip */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between">
          <span className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold">
            Function
          </span>
          {isReturn && (
            <span className="text-rose-700 font-bold uppercase tracking-wider text-[10px]">
              ⚠️ Sales Return Active Mode
            </span>
          )}
        </div>

        {/* Upper Filter & Details Section (Image 2) */}
        <div className="p-2.5 bg-[#f1f5f9] border-b border-slate-300 space-y-1.5 text-[11px]">
          {/* Row 1: Patient Type, Pay Mode, Member, Date */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {['General', 'IPD', 'Member', 'OPD'].map((t) => (
                <label key={t} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="patientType"
                    checked={patientType === t}
                    onChange={() => setPatientType(t)}
                    className="accent-blue-700"
                  />
                  <span>{t}</span>
                </label>
              ))}

              <div className="h-4 border-r border-slate-400 mx-1"></div>

              <span className="font-semibold text-slate-700">Pay Mode</span>
              {['Cash', 'Credit'].map((pm) => (
                <label key={pm} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="payMode"
                    checked={payMode === pm}
                    onChange={() => setPayMode(pm)}
                    className="accent-blue-700"
                  />
                  <span>{pm}</span>
                </label>
              ))}
            </div>

            {/* Member & Date */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Member</span>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-16 bg-white border border-slate-400 px-1 py-0.5 text-center font-mono"
              />
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-48 bg-white border border-slate-400 px-1.5 py-0.5"
              />

              <div className="flex flex-col text-[10px] pl-2 border-l border-slate-400 leading-tight">
                <span className="text-slate-600">Date : 2021/08/30</span>
                <span className="font-semibold text-emerald-800 font-mono">{initialDateBs}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Party, Prescribe By, Old Bal */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 w-12">Party :</span>
              <input
                type="text"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value)}
                className="w-16 bg-white border border-slate-400 px-1 py-0.5 text-center font-mono"
              />
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-56 bg-white border border-slate-400 px-1.5 py-0.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Prescribe By</span>
              <input
                type="text"
                value={prescribeBy}
                onChange={(e) => setPrescribeBy(e.target.value)}
                className="w-12 bg-white border border-slate-400 px-1 py-0.5 text-center font-mono"
              />
              <input
                type="text"
                value={doctorName}
                placeholder="Doctor Name"
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-44 bg-white border border-slate-400 px-1.5 py-0.5"
              />
              <span className="text-slate-700 font-semibold ml-2">Old Bal : {oldBal.toFixed(2)}</span>
            </div>
          </div>

          {/* Row 3: Address, PAN, Tel, RefCode, Count, Prev Bill, Total */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Address</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-48 bg-white border border-slate-400 px-1.5 py-0.5"
              />
              <span className="font-semibold text-slate-700">PAN</span>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-20 bg-white border border-slate-400 px-1 py-0.5 font-mono"
              />
              <span className="font-semibold text-slate-700">Tel:</span>
              <input
                type="text"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono"
              />
              <span className="font-semibold text-slate-700">RefCode</span>
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="w-20 bg-white border border-slate-400 px-1 py-0.5 font-mono"
              />
              <span className="text-slate-600 font-semibold ml-1">Count: {items.length}</span>
              <button
                type="button"
                onClick={() => alert('Viewing previous bill history...')}
                className="text-[#0055ea] underline font-semibold hover:text-blue-900 cursor-pointer ml-1"
              >
                Prev Bill
              </button>
            </div>

            {/* Giant Total Label matching Image 2 */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800">Total :</span>
              <span className="text-3xl font-black text-[#0055ea] font-mono tracking-tight">
                {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Row 4: Insurance checkboxes */}
          <div className="flex items-center gap-4 text-[11px] text-slate-700 pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={insurance}
                onChange={(e) => setInsurance(e.target.checked)}
                className="accent-blue-700"
              />
              <span>Insurance</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Opening Bima / Health Insurance view...')}
              className="text-[#0055ea] underline cursor-pointer"
            >
              Bima View
            </button>
            <div className="flex items-center gap-1">
              <span>NSHI No</span>
              <input
                type="text"
                value={nshiNo}
                onChange={(e) => setNshiNo(e.target.value)}
                className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              <span>Claim Code</span>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                className="w-24 bg-white border border-slate-400 px-1 py-0.5 font-mono text-xs"
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={insuranceProduct}
                onChange={(e) => setInsuranceProduct(e.target.checked)}
                className="accent-blue-700"
              />
              <span>Insurance Product</span>
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Table Entry Inputs Row (Arrow In Image 2 points here!)        */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 p-1 flex items-center text-xs">
          <div className="w-12 text-center text-slate-500 font-mono font-bold text-[11px]">
            {items.length + 1}
          </div>
          {/* Md Code Input */}
          <input
            ref={mdCodeInputRef}
            type="text"
            placeholder="Code"
            value={inputMdCode}
            onChange={(e) => handleMdCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-24 bg-white border border-slate-400 px-1.5 py-1 font-mono text-xs"
            title="Type MdCode e.g. 14759 and press Enter"
          />
          {/* Particular Input with Datalist */}
          <input
            type="text"
            list="product-suggestions"
            placeholder="Product / Particular"
            value={inputParticular}
            onChange={(e) => handleParticularChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-[200px] bg-white border border-slate-400 px-2 py-1 font-sans text-xs ml-1"
          />
          <datalist id="product-suggestions">
            {SAMPLE_PRODUCTS.map((p) => (
              <option key={p.mdCode} value={p.brandName}>
                [{p.mdCode}] {p.brandName} - Rs. {p.sPrice} ({p.stock} in stock)
              </option>
            ))}
          </datalist>

          {/* WSUnit */}
          <input
            type="text"
            value={inputWsUnit}
            onChange={(e) => setInputWsUnit(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 bg-white border border-slate-400 px-1.5 py-1 text-center font-mono text-xs ml-1"
          />
          {/* Pack */}
          <input
            type="text"
            value={inputPack}
            onChange={(e) => setInputPack(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 bg-white border border-slate-400 px-1.5 py-1 text-center font-sans text-xs ml-1"
          />
          {/* Qty Input (Highlighted in Image 2 with blue border & focus!) */}
          <input
            ref={qtyInputRef}
            type="number"
            value={inputQty}
            onChange={(e) => setInputQty(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 bg-[#e6f0ff] border-2 border-[#0055ea] px-1.5 py-1 text-right font-mono font-bold text-xs text-blue-900 ml-1 outline-hidden"
            title="Type Quantity and press Enter"
          />
          {/* Bonus */}
          <input
            type="number"
            value={inputBonus}
            onChange={(e) => setInputBonus(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 bg-white border border-slate-400 px-1.5 py-1 text-right font-mono text-xs ml-1"
          />
          {/* Rate */}
          <input
            type="number"
            step="0.01"
            value={inputRate}
            onChange={(e) => setInputRate(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 bg-white border border-slate-400 px-1.5 py-1 text-right font-mono text-xs ml-1"
          />
          {/* Disc % */}
          <input
            type="number"
            step="0.01"
            value={inputDiscPercent}
            onChange={(e) => setInputDiscPercent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 bg-white border border-slate-400 px-1.5 py-1 text-right font-mono text-xs ml-1"
          />
          {/* Amount (Readonly) */}
          <input
            type="text"
            readOnly
            value={currentAmount.toFixed(2)}
            className="w-24 bg-[#f4f2e6] border border-slate-400 px-1.5 py-1 text-right font-mono font-bold text-xs ml-1"
          />
          {/* Add button */}
          <button
            type="button"
            onClick={handleAddItem}
            className="ml-1 px-3 py-1 bg-[#0f766e] text-white hover:bg-blue-700 font-bold text-xs rounded-xs"
            title="Press Enter or click to add item"
          >
            Enter ↵
          </button>
        </div>

        {/* Data Grid with Bright Blue Header (Image 2) */}
        <div className="flex-1 bg-white overflow-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#0055ea] text-white sticky top-0 z-10 font-bold select-none text-[11px]">
              <tr>
                <th className="p-1 px-2 border-r border-blue-400 w-12 text-center">Serial</th>
                <th className="p-1 px-2 border-r border-blue-400 w-24">Md Code</th>
                <th className="p-1 px-2 border-r border-blue-400">Particular</th>
                <th className="p-1 px-2 border-r border-blue-400 w-16 text-center">WSUnit</th>
                <th className="p-1 px-2 border-r border-blue-400 w-16 text-center">Pack</th>
                <th className="p-1 px-2 border-r border-blue-400 w-20 text-right">Qty</th>
                <th className="p-1 px-2 border-r border-blue-400 w-16 text-right">Bonus</th>
                <th className="p-1 px-2 border-r border-blue-400 w-20 text-right">Rate</th>
                {/* Clickable Disc % header (Image 3 request!) */}
                <th
                  onClick={() => setSettlementOpen(true)}
                  className="p-1 px-2 border-r border-blue-400 w-20 text-right cursor-pointer hover:bg-blue-600 transition underline tracking-wider"
                  title="Click to open Discount & Settlement (Image 3)"
                >
                  Disc % ⬈
                </th>
                <th className="p-1 px-2 w-28 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    Type medicine details above and press{' '}
                    <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-xs">
                      Enter ↵
                    </kbd>{' '}
                    to add to sales bill.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const isSelected = selectedRow === idx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRow(idx)}
                      className={`cursor-pointer border-b border-slate-200 transition ${
                        isSelected ? 'bg-[#0f766e] text-white' : idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'
                      }`}
                    >
                      <td className="p-1 px-2 border-r border-slate-200 text-center font-mono">
                        {item.serial}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200 font-mono">{item.mdCode}</td>
                      <td className="p-1 px-2 border-r border-slate-200 font-medium">
                        {item.particular}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200 text-center">{item.wsUnit}</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-center">{item.pack}</td>
                      <td
                        className={`p-1 px-2 border-r border-slate-200 text-right font-mono font-bold ${
                          item.qty < 0 ? 'text-amber-800' : ''
                        }`}
                      >
                        {item.qty}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right font-mono">
                        {item.bonus}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right font-mono">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right font-mono">
                        {item.discPercent.toFixed(2)}
                      </td>
                      <td className="p-1 px-2 text-right font-mono font-bold">
                        {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Lower Stats Strip (Image 2) */}
        <div className="bg-[#f1f5f9] border-t border-slate-300 p-2 flex items-center justify-between text-[11px] text-slate-800 font-sans">
          <div className="flex items-center gap-6">
            <div className="space-y-0.5">
              <div>
                Stock : <strong className="font-mono text-blue-900">{activeStock}</strong>
              </div>
              <div>Packing : </div>
              <div>Bonus : 0+0</div>
              <div>Lot Bonus : 0+0</div>
            </div>
            <div className="space-y-0.5 pl-4 border-l border-slate-400">
              <div>
                Locked Stock : <strong className="font-mono">0</strong>
              </div>
              <div className="text-slate-500">
                Tip: Click <strong className="text-blue-900 underline cursor-pointer" onClick={() => setSettlementOpen(true)}>Disc %</strong> column header to open discount popup.
              </div>
            </div>
          </div>

          {/* Action Buttons: Post, Empty Record, Close */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePostSale}
              className="w-28 py-1.5 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-900 rounded-xs shadow-xs text-xs text-center active:translate-y-px"
            >
              Post
            </button>
            <button
              type="button"
              onClick={handleEmptyRecord}
              className="w-28 py-1.5 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-900 rounded-xs shadow-xs text-xs text-center active:translate-y-px"
            >
              Empty Record
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-28 py-1.5 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-900 rounded-xs shadow-xs text-xs text-center active:translate-y-px"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Discount & Settlement Modal (Image 3) */}
      <DiscountSettlementModal
        isOpen={settlementOpen}
        onClose={() => setSettlementOpen(false)}
        totalAmount={totalAmount}
        onApplyDiscount={handleCompletePost}
      />
    </div>
  );
}

