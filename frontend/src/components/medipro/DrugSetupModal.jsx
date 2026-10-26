import React, { useState } from 'react';

const categories = [
  { id: 'company_setup', label: 'Company Setup', enabled: true },
  { id: 'drug_category_setup', label: 'Drug Category Setup' },
  { id: 'drug_group_setup', label: 'Drug Group Setup' },
  { id: 'generic_name_setup', label: 'Generic Name Setup', enabled: true },
  { id: 'product_division_setup', label: 'Product Division Setup' },
  { id: 'product_rack_group_setup', label: 'Product Rack Group Setup' },
  { id: 'product_rack_setup', label: 'Product Rack Setup' },
  { id: 'product_setup', label: 'Product Setup', enabled: true }, // default
  { id: 'open_stock_entry', label: 'Open Stock Entry' },
  { id: 'open_stock_list', label: 'Open Stock List' },
  { id: 'sales_template_setup', label: 'Sales Template Setup' },
  { id: 'companywise_party_discount', label: 'Companywise Party Discount' },
  { id: 'transporter_setup', label: 'Transpoter Setup' },
  { id: 'companywise_supplier_discount', label: 'Companywise Supplier Discount' },
  { id: 'doses_setup', label: 'Doses Setup' },
  { id: 'scheme_discount_catalogue', label: 'Scheme Discount Catalogue' },
];

export default function DrugSetupModal({ isOpen, onClose, onSelectCategory }) {
  const [selected, setSelected] = useState('product_setup');

  if (!isOpen) return null;

  const handleSelect = () => {
    if (onSelectCategory) {
      onSelectCategory(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      {/* MediPro classic Windows form styling */}
      <div className="w-full max-w-sm bg-[#ece9d8] border-2 border-slate-400 shadow-2xl rounded-xs overflow-hidden text-slate-900 font-sans text-xs">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white px-2 py-1 flex items-center justify-between font-bold select-none">
          <span className="text-[11px] tracking-wide">Product Setup Category</span>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ece9d8] text-slate-800 hover:bg-rose-500 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
          >
            ×
          </button>
        </div>

        {/* Sub-menu bar */}
        <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700">
          <span className="px-1 text-slate-400">Function</span>
        </div>

        {/* Options List */}
        <div className="p-3 bg-white border border-slate-300 m-2.5 max-h-96 overflow-y-auto space-y-1">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className={`flex items-center gap-2 px-1.5 py-0.5 rounded select-none text-xs ${
                cat.enabled
                  ? `cursor-pointer hover:bg-[#316ac5] hover:text-white ${
                    selected === cat.id ? 'bg-[#316ac5] text-white font-semibold' : 'text-slate-800'
                  }`
                  : 'cursor-not-allowed text-slate-400'
              }`}
              onDoubleClick={() => {
                if (cat.enabled) {
                  setSelected(cat.id);
                  if (cat.id === 'product_setup') {
                    onSelectCategory('product_setup');
                  }
                }
              }}
            >
              <input
                type="radio"
                name="drug_category"
                checked={selected === cat.id}
                onChange={() => setSelected(cat.id)}
                disabled={!cat.enabled}
                className={cat.enabled ? 'cursor-pointer accent-[#0a246a]' : 'cursor-not-allowed accent-slate-300'}
              />
              <span className="leading-tight">{cat.label}</span>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 py-2 bg-[#ece9d8] border-t border-slate-300">
          <button
            onClick={handleSelect}
            className="px-6 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-medium text-slate-900 active:translate-y-0.5 transition"
          >
            Select
          </button>
          <button
            onClick={onClose}
            className="px-6 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-medium text-slate-900 active:translate-y-0.5 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
