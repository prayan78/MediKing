import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import api from '../../services/api';
import CompanySetupModal from './CompanySetupModal';

export default function ProductEditModal({ isOpen, onClose, product, onSaved }) {
  const isEditMode = Boolean(product && product._id);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    mdCode: '',
    brandName: '',
    companyCode: 228,
    companyName: 'PHARMA DIVISION OF ASIAN PHARMACEUTIC.',
    genericName: 'PANTOPRAZOLE-40MG',
    generics: [{ genId: 1718, genericName: 'PANTOPRAZOLE-40MG' }],
    isInsuranceProduct: false,
    vat: 'N',
    vatPercent: 0,
    vatOnFree: false,
    category: 'Antacid',
    categoryCode: 0,
    groupName: '',
    groupCode: 0,
    refCode: '',
    ssfCode: '',
    unit: 'TAB',
    wsUnit: 1,
    packing: '1',
    ccCharge: 0,
    barcode: '',
    prodDivision: 0,
    inBox: 0,
    onlinePublished: false,

    // Pricing
    iPrice: 6.9,
    excise: 0,
    exPrice: 0,
    cPrice: 6.9,
    margin: 15.94,
    sPrice: 8.0,
    mrp: 8.0,
    discPercent: 0,
    mrRate: 0,
    insuranceRate: 0,

    // Bonus
    onMinQty: 0,
    bonus: 0,
    onMinLot: 0,
    lotBonus: 0,

    // Other Information
    rackNo: 'RACK-A01',
    roLevel: 0,
    drugCategory: 'Essential',
    safetyStock: 0,
    salesPeriod: 0,
    leadTime: 0,
    stockDays: 0,
    status: 'Active',
    doseType: '',
    doseUnit: '',
  });

  const [newGenId, setNewGenId] = useState('');
  const [newGenName, setNewGenName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddGenRow, setShowAddGenRow] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        mdCode: product.mdCode || '',
        brandName: product.brandName || '',
        companyCode: product.companyCode || 228,
        companyName: product.companyName || 'PHARMA DIVISION OF ASIAN PHARMACEUTIC.',
        genericName: product.genericName || '',
        generics:
          product.generics && product.generics.length > 0
            ? product.generics
            : [{ genId: 1001, genericName: product.genericName || product.brandName }],
        isInsuranceProduct: Boolean(product.isInsuranceProduct),
        vat: product.vat || 'N',
        vatPercent: product.vatPercent || 0,
        vatOnFree: Boolean(product.vatOnFree),
        category: product.category || 'General',
        categoryCode: product.categoryCode || 0,
        groupName: product.groupName || '',
        groupCode: product.groupCode || 0,
        refCode: product.refCode || '',
        ssfCode: product.ssfCode || '',
        unit: product.unit || 'TAB',
        wsUnit: product.wsUnit || 1,
        packing: product.packing || '1',
        ccCharge: product.ccCharge || 0,
        barcode: product.barcode || '',
        prodDivision: product.prodDivision || 0,
        inBox: product.inBox || 0,
        onlinePublished: Boolean(product.onlinePublished),

        iPrice: product.iPrice ?? product.cPrice ?? 0,
        excise: product.excise || 0,
        exPrice: product.exPrice || 0,
        cPrice: product.cPrice ?? product.iPrice ?? 0,
        margin: product.margin || 0,
        sPrice: product.sPrice ?? product.mrp ?? 0,
        mrp: product.mrp ?? product.sPrice ?? 0,
        discPercent: product.discPercent || 0,
        mrRate: product.mrRate || 0,
        insuranceRate: product.insuranceRate || 0,

        onMinQty: product.onMinQty || 0,
        bonus: product.bonus || 0,
        onMinLot: product.onMinLot || 0,
        lotBonus: product.lotBonus || 0,

        rackNo: product.rackNo || product.rackLocation || '',
        roLevel: product.roLevel || 0,
        drugCategory: product.drugCategory || 'Essential',
        safetyStock: product.safetyStock || 0,
        salesPeriod: product.salesPeriod || 0,
        leadTime: product.leadTime || 0,
        stockDays: product.stockDays || 0,
        status: product.status || 'Active',
        doseType: product.doseType || '',
        doseUnit: product.doseUnit || '',
      });
    } else {
      // Empty state for Add
      setFormData({
        mdCode: '',
        brandName: '',
        companyCode: 228,
        companyName: 'PHARMA DIVISION OF ASIAN PHARMACEUTIC.',
        genericName: '',
        generics: [{ genId: 1001, genericName: '' }],
        isInsuranceProduct: false,
        vat: 'N',
        vatPercent: 0,
        vatOnFree: false,
        category: 'General',
        categoryCode: 0,
        groupName: '',
        groupCode: 0,
        refCode: '',
        ssfCode: '',
        unit: 'TAB',
        wsUnit: 1,
        packing: '1',
        ccCharge: 0,
        barcode: '',
        prodDivision: 0,
        inBox: 0,
        onlinePublished: false,

        iPrice: 0,
        excise: 0,
        exPrice: 0,
        cPrice: 0,
        margin: 0,
        sPrice: 0,
        mrp: 0,
        discPercent: 0,
        mrRate: 0,
        insuranceRate: 0,

        onMinQty: 0,
        bonus: 0,
        onMinLot: 0,
        lotBonus: 0,

        rackNo: '',
        roLevel: 0,
        drugCategory: 'Essential',
        safetyStock: 0,
        salesPeriod: 0,
        leadTime: 0,
        stockDays: 0,
        status: 'Active',
        doseType: '',
        doseUnit: '',
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };

      // Margin & Price Calculation Engine
      if (name === 'cPrice' || name === 'margin') {
        const cost = name === 'cPrice' ? Number(val) : Number(prev.cPrice);
        const marginPct = name === 'margin' ? Number(val) : Number(prev.margin);
        if (cost > 0) {
          const calculatedSelling = cost + (cost * marginPct) / 100;
          updated.sPrice = Number(calculatedSelling.toFixed(2));
          if (!updated.mrp || updated.mrp < updated.sPrice) {
            updated.mrp = updated.sPrice;
          }
        }
      } else if (name === 'sPrice') {
        const selling = Number(val);
        const cost = Number(prev.cPrice);
        if (cost > 0) {
          const calculatedMargin = ((selling - cost) / cost) * 100;
          updated.margin = Number(calculatedMargin.toFixed(2));
        }
      }

      return updated;
    });
  };

  const handleAddGeneric = () => {
    if (!newGenName) return;
    const nextId = newGenId ? Number(newGenId) : 1000 + formData.generics.length + 1;
    const updated = [...formData.generics, { genId: nextId, genericName: newGenName.toUpperCase() }];
    setFormData((prev) => ({
      ...prev,
      generics: updated,
      genericName: updated.map((g) => g.genericName).join(', '),
    }));
    setNewGenId('');
    setNewGenName('');
    setShowAddGenRow(false);
  };

  const handleDeleteGeneric = (index) => {
    const updated = formData.generics.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      generics: updated,
      genericName: updated.map((g) => g.genericName).join(', '),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.brandName) {
      setError('Product Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/products/${product._id}`, formData);
      } else {
        res = await api.post('/products', formData);
      }

      if (onSaved) {
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-2 overflow-y-auto">
      {/* Classic MediPro Window */}
      <div className="w-full max-w-4xl bg-[#ece9d8] border-2 border-slate-500 shadow-2xl rounded-xs overflow-hidden text-slate-900 font-sans text-xs my-4">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white px-2 py-1 flex items-center justify-between font-bold select-none">
          <span className="text-[11px] tracking-wide">
            Product Setup <span className="font-normal text-[10px] ml-2 text-yellow-200">(F6 For Add Generic)</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
            >
              ×
            </button>
          </div>
        </div>

        {/* Sub-menu bar */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="underline cursor-pointer hover:bg-blue-100 px-1">Function</span>
            <span onClick={onClose} className="underline cursor-pointer hover:bg-blue-100 px-1">Exit</span>
          </div>
          <span className="text-[10px] text-slate-500">MediKing Master Catalog</span>
        </div>

        {error && (
          <div className="bg-rose-100 border-b border-rose-300 px-3 py-1.5 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-3 space-y-2.5">
          {/* Section: Product Definition */}
          <div className="border border-slate-300 p-2.5 bg-[#fbfbf9] rounded-xs">
            <div className="text-[11px] font-bold text-[#0a246a] mb-2 uppercase tracking-wide border-b border-slate-200 pb-0.5">
              Product Definition
            </div>

            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Company */}
              <div className="col-span-12 sm:col-span-2 text-right font-medium">Company</div>
              <div className="col-span-12 sm:col-span-10 flex items-center gap-1.5">
                <input
                  type="number"
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  className="w-16 px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="flex-1 px-1.5 py-0.5 border border-slate-400 bg-white text-xs uppercase"
                  placeholder="Company / Manufacturer Name"
                />
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(true)}
                  className="px-2 py-0.5 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] border border-slate-500 text-[10px] font-bold text-slate-800 shadow-xs whitespace-nowrap"
                >
                  Select (F6)
                </button>
              </div>

              {/* Product Name */}
              <div className="col-span-12 sm:col-span-2 text-right font-medium">Product Name</div>
              <div className="col-span-12 sm:col-span-10 flex items-center gap-1.5">
                <input
                  type="number"
                  name="mdCode"
                  value={formData.mdCode}
                  onChange={handleChange}
                  placeholder="Auto"
                  className="w-16 px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  title="MD Code"
                />
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="flex-1 px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-bold uppercase text-[#0a246a]"
                  placeholder="e.g. PANTOP-40MG"
                  required
                />
                <label className="flex items-center gap-1 text-[11px] whitespace-nowrap cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    name="isInsuranceProduct"
                    checked={formData.isInsuranceProduct}
                    onChange={handleChange}
                  />
                  <span>Insurance Product</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] ml-2">
                  <span>VAT</span>
                  <select
                    name="vat"
                    value={formData.vat}
                    onChange={handleChange}
                    className="border border-slate-400 bg-white px-1 py-0.5 text-xs"
                  >
                    <option value="N">N (Exempt)</option>
                    <option value="Y">Y (13%)</option>
                    <option value="0">0%</option>
                  </select>
                </div>
              </div>

              {/* Generic Name Grid */}
              <div className="col-span-12 sm:col-span-2 text-right font-medium self-start mt-1">Generic Name</div>
              <div className="col-span-12 sm:col-span-10">
                <div className="border border-slate-400 bg-white overflow-hidden">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#ece9d8] border-b border-slate-300 text-slate-700">
                        <th className="px-2 py-0.5 w-16 border-r border-slate-300">genid</th>
                        <th className="px-2 py-0.5">genericname</th>
                        <th className="px-1 py-0.5 w-8 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {formData.generics.map((g, idx) => (
                        <tr key={idx} className="hover:bg-blue-50">
                          <td className="px-2 py-0.5 text-slate-600 border-r border-slate-200">{g.genId}</td>
                          <td className="px-2 py-0.5 font-bold text-slate-900">{g.genericName}</td>
                          <td className="px-1 py-0.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteGeneric(idx)}
                              className="text-rose-600 hover:text-rose-800"
                              title="Delete Generic"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {showAddGenRow && (
                        <tr className="bg-yellow-50">
                          <td className="px-1 py-0.5 border-r border-slate-200">
                            <input
                              type="number"
                              value={newGenId}
                              onChange={(e) => setNewGenId(e.target.value)}
                              placeholder="ID"
                              className="w-full px-1 border border-slate-300 bg-white text-xs"
                            />
                          </td>
                          <td className="px-1 py-0.5">
                            <input
                              type="text"
                              value={newGenName}
                              onChange={(e) => setNewGenName(e.target.value)}
                              placeholder="Type Generic Name..."
                              className="w-full px-1 border border-slate-300 bg-white text-xs uppercase"
                              autoFocus
                            />
                          </td>
                          <td className="px-1 py-0.5 text-center">
                            <button
                              type="button"
                              onClick={handleAddGeneric}
                              className="px-1.5 bg-emerald-600 text-white rounded-xs text-[10px]"
                            >
                              OK
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5 px-0.5">
                  <span>-F6 for add Generic -Press Delete key for Delete Generic</span>
                  <button
                    type="button"
                    onClick={() => setShowAddGenRow(!showAddGenRow)}
                    className="flex items-center gap-1 text-teal-700 hover:underline font-bold"
                  >
                    <Plus size={11} /> {showAddGenRow ? 'Cancel' : 'Add Generic Row'}
                  </button>
                </div>
              </div>

              {/* Category, Group, Ref, SSF */}
              <div className="col-span-12 sm:col-span-2 text-right font-medium">Category</div>
              <div className="col-span-12 sm:col-span-4 flex items-center gap-1">
                <input
                  type="number"
                  name="categoryCode"
                  value={formData.categoryCode}
                  onChange={handleChange}
                  className="w-12 px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex-1 px-1 py-0.5 border border-slate-400 bg-white text-xs"
                />
              </div>

              <div className="col-span-12 sm:col-span-2 text-right font-medium">Group Name</div>
              <div className="col-span-12 sm:col-span-4 flex items-center gap-1">
                <input
                  type="number"
                  name="groupCode"
                  value={formData.groupCode}
                  onChange={handleChange}
                  className="w-12 px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                />
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleChange}
                  className="flex-1 px-1 py-0.5 border border-slate-400 bg-white text-xs"
                />
              </div>

              <div className="col-span-12 sm:col-span-2 text-right font-medium">Ref Code</div>
              <div className="col-span-12 sm:col-span-4 flex items-center gap-2">
                <input
                  type="text"
                  name="refCode"
                  value={formData.refCode}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 border border-slate-400 bg-white text-xs"
                />
              </div>

              <div className="col-span-12 sm:col-span-2 text-right font-medium">SSF Code</div>
              <div className="col-span-12 sm:col-span-4 flex items-center gap-2">
                <input
                  type="text"
                  name="ssfCode"
                  value={formData.ssfCode}
                  onChange={handleChange}
                  placeholder="e.g. SSF-PNT-40"
                  className="w-full px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                />
              </div>

              {/* Unit, Ws Unit, Packing, CC Charge */}
              <div className="col-span-12 sm:col-span-2 text-right font-medium">Unit</div>
              <div className="col-span-12 sm:col-span-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-20 px-1 py-0.5 border border-slate-400 bg-white text-xs font-bold"
                  />
                  <span className="text-[11px] text-slate-600">Ws Unit</span>
                  <input
                    type="number"
                    name="wsUnit"
                    value={formData.wsUnit}
                    onChange={handleChange}
                    className="w-10 px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-600">Packing</span>
                  <input
                    type="text"
                    name="packing"
                    value={formData.packing}
                    onChange={handleChange}
                    className="w-16 px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-600">C.C.Charge</span>
                  <input
                    type="number"
                    name="ccCharge"
                    value={formData.ccCharge}
                    onChange={handleChange}
                    className="w-16 px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-600">Barcode</span>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Pricing (Left), Bonus (Middle), Other Info (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Price Column */}
            <div className="md:col-span-4 border border-slate-300 p-2.5 bg-[#fbfbf9] rounded-xs space-y-1">
              <div className="text-[11px] font-bold text-[#0a246a] border-b border-slate-200 pb-0.5 mb-1.5 uppercase">
                Price
              </div>
              <div className="grid grid-cols-2 gap-1 items-center">
                <span className="text-right">I price</span>
                <input
                  type="number"
                  step="0.01"
                  name="iPrice"
                  value={formData.iPrice}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono text-right"
                />

                <span className="text-right">Excise</span>
                <input
                  type="number"
                  step="0.01"
                  name="excise"
                  value={formData.excise}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono text-right"
                />

                <span className="text-right">Ex.Price</span>
                <input
                  type="number"
                  step="0.01"
                  name="exPrice"
                  value={formData.exPrice}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono text-right"
                />

                <span className="text-right font-bold text-slate-900">C.Price</span>
                <input
                  type="number"
                  step="0.01"
                  name="cPrice"
                  value={formData.cPrice}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono font-bold text-right"
                />

                <span className="text-right text-teal-800 font-bold">Margin %</span>
                <input
                  type="number"
                  step="0.01"
                  name="margin"
                  value={formData.margin}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-teal-500 bg-teal-50 text-xs font-mono font-bold text-right text-teal-900"
                />

                <span className="text-right font-bold text-[#0a246a]">S.Price</span>
                <input
                  type="number"
                  step="0.01"
                  name="sPrice"
                  value={formData.sPrice}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-500 bg-yellow-50 text-xs font-mono font-bold text-right text-blue-900"
                />

                <span className="text-right">VAT %</span>
                <input
                  type="number"
                  step="0.01"
                  name="vatPercent"
                  value={formData.vatPercent}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono text-right"
                />

                <span className="text-right font-bold">M.R.P.</span>
                <input
                  type="number"
                  step="0.01"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-500 bg-white text-xs font-mono font-bold text-right text-slate-900"
                />

                <span className="text-right">DISC. %</span>
                <input
                  type="number"
                  step="0.01"
                  name="discPercent"
                  value={formData.discPercent}
                  onChange={handleChange}
                  className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono text-right"
                />
              </div>
            </div>

            {/* Bonus & Other Information Column */}
            <div className="md:col-span-8 space-y-2">
              {/* Bonus */}
              <div className="border border-slate-300 p-2 bg-[#fbfbf9] rounded-xs">
                <div className="text-[11px] font-bold text-[#0a246a] border-b border-slate-200 pb-0.5 mb-1.5 uppercase">
                  Bonus
                </div>
                <div className="grid grid-cols-4 gap-2 items-center text-[11px]">
                  <span className="text-right">On Min Qty</span>
                  <input
                    type="number"
                    name="onMinQty"
                    value={formData.onMinQty}
                    onChange={handleChange}
                    className="px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />

                  <span className="text-right">Bonus</span>
                  <input
                    type="number"
                    name="bonus"
                    value={formData.bonus}
                    onChange={handleChange}
                    className="px-1 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Other Information */}
              <div className="border border-slate-300 p-2.5 bg-[#fbfbf9] rounded-xs">
                <div className="text-[11px] font-bold text-[#0a246a] border-b border-slate-200 pb-0.5 mb-1.5 uppercase">
                  Other Information
                </div>
                <div className="grid grid-cols-4 gap-2 items-center text-[11px]">
                  <span className="text-right font-medium">Rack No.</span>
                  <input
                    type="text"
                    name="rackNo"
                    value={formData.rackNo}
                    onChange={handleChange}
                    placeholder="RACK-A01"
                    className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono uppercase"
                  />

                  <span className="text-right font-medium">RO Level</span>
                  <input
                    type="number"
                    name="roLevel"
                    value={formData.roLevel}
                    onChange={handleChange}
                    className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />

                  <span className="text-right font-medium">Drug Category</span>
                  <select
                    name="drugCategory"
                    value={formData.drugCategory}
                    onChange={handleChange}
                    className="px-1 py-0.5 border border-slate-400 bg-white text-xs"
                  >
                    <option value="Essential">Essential</option>
                    <option value="Narcotic">Narcotic</option>
                    <option value="Normal">Normal</option>
                    <option value="Life Saving">Life Saving</option>
                  </select>

                  <span className="text-right font-medium">Safety Stock</span>
                  <input
                    type="number"
                    name="safetyStock"
                    value={formData.safetyStock}
                    onChange={handleChange}
                    className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />

                  <span className="text-right font-medium">Status</span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="px-1 py-0.5 border border-slate-400 bg-white text-xs font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <span className="text-right font-medium">Lead Time</span>
                  <input
                    type="number"
                    name="leadTime"
                    value={formData.leadTime}
                    onChange={handleChange}
                    className="px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-300">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-1.5 bg-[#ece9d8] hover:bg-[#dfdbcd] border-2 border-slate-600 shadow-md text-xs font-bold text-slate-900 active:translate-y-0.5 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={13} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-1.5 bg-[#ece9d8] hover:bg-[#dfdbcd] border-2 border-slate-600 shadow-md text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <CompanySetupModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onSelectCompany={(c) => {
          setFormData((prev) => ({
            ...prev,
            companyCode: c.compCode,
            companyName: c.companyName,
          }));
        }}
      />
    </div>
  );
}
