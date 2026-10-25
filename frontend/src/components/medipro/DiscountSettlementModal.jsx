import React, { useState, useEffect } from 'react';

export default function DiscountSettlementModal({
  isOpen,
  onClose,
  totalAmount = 64.0,
  onApplyDiscount,
}) {
  const [discPercent, setDiscPercent] = useState(5.0);
  const [naration, setNaration] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [tender, setTender] = useState(100.0);
  const [rdFreightPercent, setRdFreightPercent] = useState(0.0);
  const [freight, setFreight] = useState(0.0);
  const [taxableAmount, setTaxableAmount] = useState(0.0);
  const [vat, setVat] = useState(0.0);
  const [vatOnFree, setVatOnFree] = useState(0.0);
  const [scheme, setScheme] = useState(0.0);
  const [claimDiscPercent, setClaimDiscPercent] = useState(0.0);
  const [extraDiscPercent, setExtraDiscPercent] = useState(0.0);
  const [note, setNote] = useState('');
  const [skipToken, setSkipToken] = useState(false);

  if (!isOpen) return null;

  const total = Number(totalAmount) || 0;
  const discVal = Number(((total * discPercent) / 100).toFixed(2));
  const netTotal = Number((total - discVal + freight).toFixed(2));
  const change = Number((tender - netTotal).toFixed(2));

  const handlePost = () => {
    if (onApplyDiscount) {
      onApplyDiscount({
        discPercent,
        discVal,
        netTotal,
        payMode,
        tender,
        change,
        note,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 select-none font-sans">
      {/* Exact MediPro Window styling matching Image 3 */}
      <div className="w-[820px] max-w-[96vw] bg-[#ece9d8] border-2 border-slate-600 shadow-2xl flex flex-col text-xs text-slate-800">
        {/* Title Bar */}
        <div className="bg-[#2b4c7e] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
          <span>Discount & Settlement</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Function Strip */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700">
          <span className="underline cursor-pointer hover:bg-blue-100 px-1 font-semibold">
            Function
          </span>
        </div>

        {/* Body Area matching Image 3 */}
        <div className="p-4 bg-[#ece9d8] space-y-3 text-[11px]">
          {/* Top Section */}
          <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-center">
            {/* Total */}
            <div className="col-span-2 text-right font-bold text-slate-800">Total :</div>
            <div className="col-span-3">
              <input
                type="text"
                readOnly
                value={total.toFixed(2)}
                className="w-full bg-[#f4f2e6] border border-slate-400 px-2 py-0.5 text-right font-mono font-bold"
              />
            </div>
            {/* Naration */}
            <div className="col-span-2 text-right font-semibold text-slate-700">Naration</div>
            <div className="col-span-5">
              <input
                type="text"
                value={naration}
                onChange={(e) => setNaration(e.target.value)}
                className="w-full bg-white border border-slate-400 px-2 py-0.5"
              />
            </div>

            {/* Discount row */}
            <div className="col-span-2 text-right font-bold text-slate-800">Discount :</div>
            <div className="col-span-4 flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                value={discPercent}
                onChange={(e) => setDiscPercent(Number(e.target.value) || 0)}
                className="w-16 bg-white border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
              <span className="font-semibold text-slate-700">% On</span>
              <input
                type="text"
                readOnly
                value={total.toFixed(2)}
                className="w-20 bg-[#f4f2e6] border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                readOnly
                value={discVal.toFixed(2)}
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1 py-0.5 text-right font-mono font-bold"
              />
            </div>
            <div className="col-span-2 text-right font-semibold text-slate-700">Pay Mode</div>
            <div className="col-span-3">
              <select
                value={payMode}
                onChange={(e) => setPayMode(e.target.value)}
                className="w-full bg-white border border-slate-400 px-1 py-0.5"
              >
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
                <option value="Card">Card</option>
                <option value="QR">QR Payment</option>
              </select>
            </div>

            {/* RD Freight & Tender */}
            <div className="col-span-2 text-right font-semibold text-slate-700">RD Freight</div>
            <div className="col-span-4 flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                value={rdFreightPercent}
                onChange={(e) => setRdFreightPercent(Number(e.target.value) || 0)}
                className="w-16 bg-white border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
              <span className="font-semibold text-slate-700">%</span>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-20 bg-[#f4f2e6] border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-2 text-right font-semibold text-slate-700">Tender</div>
            <div className="col-span-3 flex items-center justify-between">
              <input
                type="number"
                value={tender}
                onChange={(e) => setTender(Number(e.target.value) || 0)}
                className="w-28 bg-white border border-slate-400 px-1.5 py-0.5 text-right font-mono font-bold"
              />
              {/* Huge Blue Total Text (Image 3) */}
              <span className="text-3xl font-black text-blue-700 font-mono tracking-tight ml-2">
                {netTotal.toFixed(2)}
              </span>
            </div>

            {/* Change & Skip Token */}
            <div className="col-span-7"></div>
            <div className="col-span-2 text-right font-semibold text-slate-700">Change</div>
            <div className="col-span-3">
              <input
                type="text"
                readOnly
                value={change.toFixed(2)}
                className="w-28 bg-[#f4f2e6] border border-slate-400 px-1.5 py-0.5 text-right font-mono font-bold text-slate-900"
              />
            </div>

            <div className="col-span-7"></div>
            <div className="col-span-5 flex items-center gap-1.5">
              <input
                type="checkbox"
                id="skipToken"
                checked={skipToken}
                onChange={(e) => setSkipToken(e.target.checked)}
                className="accent-blue-700"
              />
              <label htmlFor="skipToken" className="cursor-pointer text-slate-700">
                Skip Token Number
              </label>
            </div>
          </div>

          <div className="border-t border-slate-300 my-2"></div>

          {/* Lower Grid matching Image 3 */}
          <div className="grid grid-cols-12 gap-x-3 gap-y-1.5 items-center">
            <div className="col-span-2 text-right font-semibold text-slate-700">
              Scheme Discount
            </div>
            <div className="col-span-4 flex items-center gap-1">
              <input
                type="text"
                className="w-20 bg-white border border-slate-400 px-1.5 py-0.5 text-xs font-mono"
              />
              <input
                type="text"
                className="flex-1 bg-white border border-slate-400 px-1.5 py-0.5 text-xs"
              />
            </div>
            <div className="col-span-6"></div>

            {/* Freight & Note */}
            <div className="col-span-4 text-right font-semibold text-slate-700">Freight</div>
            <div className="col-span-2">
              <input
                type="number"
                value={freight}
                onChange={(e) => setFreight(Number(e.target.value) || 0)}
                className="w-full bg-white border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-1 text-right font-semibold text-slate-700">Note</div>
            <div className="col-span-5">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border border-slate-400 px-2 py-0.5"
              />
            </div>

            {/* Taxable Amount */}
            <div className="col-span-4 text-right font-semibold text-slate-700">Taxable Amount</div>
            <div className="col-span-2">
              <input
                type="text"
                readOnly
                value={taxableAmount.toFixed(2)}
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-6"></div>

            {/* VAT */}
            <div className="col-span-4 text-right font-semibold text-slate-700">VAT</div>
            <div className="col-span-2">
              <input
                type="text"
                readOnly
                value={vat.toFixed(2)}
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-6"></div>

            {/* VAT On Free */}
            <div className="col-span-4 text-right font-semibold text-slate-700">VAT On Free</div>
            <div className="col-span-2">
              <input
                type="text"
                readOnly
                value={vatOnFree.toFixed(2)}
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-6"></div>

            {/* Scheme */}
            <div className="col-span-4 text-right font-semibold text-slate-700">Scheme</div>
            <div className="col-span-2">
              <input
                type="text"
                readOnly
                value={scheme.toFixed(2)}
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1.5 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-6"></div>

            {/* Claim Discount */}
            <div className="col-span-4 text-right font-semibold text-slate-700">Claim Discount</div>
            <div className="col-span-2 flex items-center gap-1">
              <input
                type="number"
                value={claimDiscPercent}
                onChange={(e) => setClaimDiscPercent(Number(e.target.value) || 0)}
                className="w-16 bg-white border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
              <span>%</span>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-6"></div>

            {/* Extra Discount */}
            <div className="col-span-4 text-right font-semibold text-slate-700">Extra Discount</div>
            <div className="col-span-2 flex items-center gap-1">
              <input
                type="number"
                value={extraDiscPercent}
                onChange={(e) => setExtraDiscPercent(Number(e.target.value) || 0)}
                className="w-16 bg-white border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
              <span>%</span>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full bg-[#f4f2e6] border border-slate-400 px-1 py-0.5 text-right font-mono"
              />
            </div>
            <div className="col-span-6"></div>
          </div>
        </div>

        {/* Bottom Actions Bar matching Image 3 */}
        <div className="bg-[#f0f0f0] border-t border-slate-300 px-4 py-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="w-28 py-1 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs text-center"
          >
            Back
          </button>

          <div className="bg-white border border-slate-400 px-3 py-1 font-mono font-bold text-sm text-slate-900 shadow-inner">
            {netTotal.toFixed(2)}
          </div>

          <button
            type="button"
            onClick={handlePost}
            className="w-28 py-1 bg-gradient-to-b from-[#fdfdfd] to-[#d8d8d8] hover:from-white hover:to-[#cdcdcd] border border-slate-500 font-bold text-slate-800 rounded-xs shadow-xs text-xs text-center"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

