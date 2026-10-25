import React, { useState, useEffect } from 'react';
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  Search,
  RefreshCw,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../../services/api';
import ProductEditModal from './ProductEditModal';

export default function ProductListModal({ isOpen, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Edit / Add modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/products', { params });
      const list = res.data.data || [];
      setProducts(list);
      if (list.length > 0) {
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, statusFilter]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const selectedProduct = products[selectedIndex] || null;

  const handleFirst = () => setSelectedIndex(0);
  const handlePrev = () => setSelectedIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setSelectedIndex((prev) => Math.min(products.length - 1, prev + 1));
  const handleLast = () => setSelectedIndex(Math.max(0, products.length - 1));

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setEditModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedProduct) {
      alert('Please select a product to edit');
      return;
    }
    setProductToEdit(selectedProduct);
    setEditModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedProduct) return;
    try {
      const res = await api.patch(`/products/${selectedProduct._id}/toggle-status`);
      const updated = res.data.data;
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? { ...p, status: updated.status, isActive: updated.isActive } : p))
      );
    } catch (err) {
      alert('Unable to toggle status');
    }
  };

  const handleProductSaved = (savedProduct) => {
    fetchProducts();
  };

  return (
    <>
      <div className="fixed inset-0 z-45 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-2 overflow-y-auto">
        {/* MediPro classic Windows form styling */}
        <div className="w-full max-w-6xl bg-[#ece9d8] border-2 border-slate-500 shadow-2xl rounded-xs overflow-hidden text-slate-900 font-sans text-xs my-2 flex flex-col h-[90vh] max-h-[850px]">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#0a246a] to-[#a6caf0] text-white px-2 py-1 flex items-center justify-between font-bold select-none shrink-0">
            <span className="text-[11px] tracking-wide">
              Product <span className="font-normal text-[10px] ml-2 text-yellow-200">(F6 For Multiple Generic Add)</span>
            </span>
            <button
              onClick={onClose}
              className="w-4 h-4 bg-[#ece9d8] text-slate-900 hover:bg-rose-600 hover:text-white flex items-center justify-center font-bold text-xs rounded-xs border border-slate-600 shadow-xs"
            >
              ×
            </button>
          </div>

          {/* Sub-menu bar */}
          <div className="bg-[#f0f0f0] border-b border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="underline cursor-pointer hover:bg-blue-100 px-1">Report</span>
              <span onClick={onClose} className="underline cursor-pointer hover:bg-blue-100 px-1">Exit</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">
              Total Records: <strong>{products.length}</strong>
            </span>
          </div>

          {/* Filter & Record Navigation Toolbar */}
          <div className="p-2 bg-[#ece9d8] border-b border-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Record Navigators: |<  <  >  >| */}
            <div className="flex items-center gap-1 bg-white border border-slate-400 p-0.5 rounded-xs">
              <button
                type="button"
                onClick={handleFirst}
                title="First Record"
                className="p-1 hover:bg-slate-200 text-slate-700 rounded-xs disabled:opacity-30"
                disabled={selectedIndex === 0 || products.length === 0}
              >
                <ChevronFirst size={14} />
              </button>
              <button
                type="button"
                onClick={handlePrev}
                title="Previous Record"
                className="p-1 hover:bg-slate-200 text-slate-700 rounded-xs disabled:opacity-30"
                disabled={selectedIndex === 0 || products.length === 0}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 font-mono text-[11px] font-bold text-[#0a246a]">
                {products.length > 0 ? selectedIndex + 1 : 0} / {products.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                title="Next Record"
                className="p-1 hover:bg-slate-200 text-slate-700 rounded-xs disabled:opacity-30"
                disabled={selectedIndex >= products.length - 1 || products.length === 0}
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={handleLast}
                title="Last Record"
                className="p-1 hover:bg-slate-200 text-slate-700 rounded-xs disabled:opacity-30"
                disabled={selectedIndex >= products.length - 1 || products.length === 0}
              >
                <ChevronLast size={14} />
              </button>
            </div>

            {/* Filter Inputs */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">Company</span>
              <input
                type="text"
                defaultValue="0"
                className="w-12 px-1.5 py-0.5 border border-slate-400 bg-white text-xs font-mono text-center"
              />

              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Product Name, Generic, MD Code..."
                  className="w-full pl-2 pr-7 py-0.5 border border-slate-400 bg-white text-xs"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                >
                  <Search size={13} />
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-0.5 border border-slate-400 bg-white text-xs font-medium"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </form>
          </div>

          {/* Table Container (MediPro High Density Grid) */}
          <div className="flex-1 overflow-auto bg-white border border-slate-400 m-2">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead className="sticky top-0 bg-[#ece9d8] border-b border-slate-400 z-10">
                <tr className="text-slate-800 text-[11px] font-semibold divide-x divide-slate-300">
                  <th className="py-1 px-2 w-8 text-center"></th>
                  <th className="py-1 px-2 w-20">Md Code</th>
                  <th className="py-1 px-2 min-w-[220px]">Product Name</th>
                  <th className="py-1 px-2 w-16">Unit</th>
                  <th className="py-1 px-2 w-20">Packing</th>
                  <th className="py-1 px-2 w-20 text-right">S_Price</th>
                  <th className="py-1 px-2 w-20 text-right">MRP</th>
                  <th className="py-1 px-2 w-16 text-right">Custom</th>
                  <th className="py-1 px-2 w-14 text-center">Vat</th>
                  <th className="py-1 px-2 w-16 text-center">RO Level</th>
                  <th className="py-1 px-2 w-18 text-center">status</th>
                  <th className="py-1 px-2 w-20 text-center">insurance</th>
                  <th className="py-1 px-2 w-24 text-right">insurance_rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="py-10 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-[#0a246a]" />
                        <span>Loading MediKing Product Catalog...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-500 font-sans">
                      No products match your search or filter.
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <tr
                        key={p._id || idx}
                        onClick={() => setSelectedIndex(idx)}
                        onDoubleClick={handleOpenEdit}
                        className={`cursor-pointer divide-x divide-slate-100 ${
                          isSelected
                            ? 'bg-[#316ac5] text-white font-semibold'
                            : idx % 2 === 0
                            ? 'bg-white hover:bg-blue-50 text-slate-900'
                            : 'bg-[#fbfbf9] hover:bg-blue-50 text-slate-900'
                        }`}
                      >
                        <td className="py-0.5 px-1 text-center">
                          {isSelected && <span className="text-yellow-300">▶</span>}
                        </td>
                        <td className="py-0.5 px-2 font-bold">{p.mdCode}</td>
                        <td className="py-0.5 px-2 font-sans font-semibold truncate max-w-xs">{p.brandName}</td>
                        <td className="py-0.5 px-2">{p.unit}</td>
                        <td className="py-0.5 px-2">{p.packing}</td>
                        <td className="py-0.5 px-2 text-right">
                          {p.sPrice ? Number(p.sPrice).toFixed(2) : '0.00'}
                        </td>
                        <td className="py-0.5 px-2 text-right">
                          {p.mrp ? Number(p.mrp).toFixed(2) : '0.00'}
                        </td>
                        <td className="py-0.5 px-2 text-right">{p.custom || 0}</td>
                        <td className="py-0.5 px-2 text-center">{p.vat || 'N'}</td>
                        <td className="py-0.5 px-2 text-center">{p.roLevel || 0}</td>
                        <td className="py-0.5 px-2 text-center font-sans font-medium">
                          {p.status === 'Active' ? (
                            <span className={isSelected ? 'text-emerald-200' : 'text-emerald-700'}>Active</span>
                          ) : (
                            <span className={isSelected ? 'text-rose-200' : 'text-rose-600'}>Inactive</span>
                          )}
                        </td>
                        <td className="py-0.5 px-2 text-center">
                          {p.isInsuranceProduct ? 'True' : 'False'}
                        </td>
                        <td className="py-0.5 px-2 text-right">{p.insuranceRate || 0}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Action Button Bar (Exact layout from Image 4) */}
          <div className="p-2 bg-[#ece9d8] border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchProducts}
                className="px-6 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                List
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-6 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="px-6 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="px-5 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                Active / Inactive
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEdit}
                className="px-8 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                Select
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-1 bg-[#ece9d8] hover:bg-[#dfdbcd] border border-slate-600 shadow-xs text-xs font-bold text-slate-900 active:translate-y-0.5 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Setup / Edit Modal */}
      <ProductEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={productToEdit}
        onSaved={handleProductSaved}
      />
    </>
  );
}
