import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../services/api';

const formatAmount = (value) => (Number(value) || 0).toFixed(2);

export default function GenericMedicineModal({ isOpen, onClose }) {
  const [genericGroups, setGenericGroups] = useState([]);
  const [selectedGeneric, setSelectedGeneric] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addGenericOpen, setAddGenericOpen] = useState(false);
  const [newGenericName, setNewGenericName] = useState('');
  const [savingGeneric, setSavingGeneric] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;

    const loadGenericMedicines = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/products/generic-medicines');
        if (!cancelled) setGenericGroups(response.data.data || []);
      } catch (loadError) {
        console.error('Failed to load generic medicines:', loadError);
        if (!cancelled) setError('Failed to load generic medicines.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadGenericMedicines();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filteredGenerics = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return genericGroups.filter((group) => !query || group.genericName.toLocaleLowerCase().includes(query));
  }, [genericGroups, search]);

  if (!isOpen) return null;

  const closeModal = () => {
    setSelectedGeneric(null);
    setSearch('');
    setAddGenericOpen(false);
    setNewGenericName('');
    setError('');
    onClose();
  };

  const handleAddGeneric = async (event) => {
    event.preventDefault();
    const genericName = newGenericName.trim().replace(/\s+/g, ' ');
    if (!genericName) {
      setError('Enter a generic name before saving.');
      return;
    }

    setSavingGeneric(true);
    setError('');
    try {
      const response = await api.post('/products/generic-medicines', { genericName });
      const addedGeneric = response.data.data;
      setGenericGroups((previous) => [...previous, addedGeneric]
        .sort((left, right) => left.genericName.localeCompare(right.genericName)));
      setSearch('');
      setNewGenericName('');
      setAddGenericOpen(false);
    } catch (saveError) {
      console.error('Failed to add generic medicine:', saveError);
      setError(saveError.response?.data?.message || 'Failed to add generic name.');
    } finally {
      setSavingGeneric(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 select-none font-sans">
        <section className="flex max-h-[82vh] w-[450px] max-w-[95vw] flex-col border-2 border-slate-600 bg-[#ece9d8] text-xs text-slate-800 shadow-2xl">
          <header className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
            <span>GenericName</span>
            <button onClick={closeModal} aria-label="Close generic medicine list" className="px-1 hover:bg-rose-600">×</button>
          </header>
          <div className="border-b border-slate-300 bg-[#f0f0f0] px-2 py-0.5">
            <div className="flex items-center justify-between">
              <button onClick={closeModal} className="underline hover:bg-blue-100">Exit</button>
              <button
                onClick={() => {
                  setError('');
                  setNewGenericName('');
                  setAddGenericOpen(true);
                }}
                className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-2 py-0.5 font-semibold hover:from-blue-50"
              >
                + Add Generic Name
              </button>
            </div>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-2 border border-slate-400 bg-white px-2 py-1">
              <Search size={13} className="text-slate-500" />
              <input
                aria-label="Search generic medicines"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search generic name..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
            <div className="sticky top-0 border-b border-slate-400 bg-[#e4e1d1] px-2 py-1 font-semibold">Generic Name</div>
            {loading ? (
              <p className="p-4 text-center text-slate-500">Loading generic medicines...</p>
            ) : error ? (
              <p role="alert" className="p-4 text-center text-rose-700">{error}</p>
            ) : filteredGenerics.length ? filteredGenerics.map((group) => (
              <button
                key={group.genericName}
                onClick={() => setSelectedGeneric(group)}
                className="flex w-full items-center gap-1 border-b border-slate-100 px-1 py-1 text-left hover:bg-[#316ac5] hover:text-white"
              >
                <span aria-hidden="true">›</span>
                <span>{group.genericName}</span>
              </button>
            )) : (
              <p className="p-4 text-center text-slate-500">{search ? 'No matching generic names.' : 'No generic medicines found.'}</p>
            )}
          </div>
        </section>
      </div>

      {addGenericOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/45 select-none font-sans">
          <form onSubmit={handleAddGeneric} className="w-[360px] max-w-[94vw] border-2 border-slate-600 bg-[#ece9d8] text-xs text-slate-800 shadow-2xl">
            <header className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
              <span>Add Generic Name</span>
              <button type="button" onClick={() => setAddGenericOpen(false)} aria-label="Close add generic dialog" className="px-1 hover:bg-rose-600">×</button>
            </header>
            <div className="space-y-2 p-3">
              <label htmlFor="new-generic-name" className="block font-semibold">Generic Name</label>
              <input
                id="new-generic-name"
                autoFocus
                maxLength={160}
                value={newGenericName}
                onChange={(event) => setNewGenericName(event.target.value)}
                placeholder="Enter generic medicine name"
                className="w-full border border-slate-400 bg-white px-2 py-1 outline-blue-600"
              />
              {error && <p role="alert" className="text-rose-700">{error}</p>}
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-300 p-2">
              <button type="button" onClick={() => setAddGenericOpen(false)} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-3 py-1">Cancel</button>
              <button type="submit" disabled={savingGeneric} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-3 py-1 font-bold disabled:opacity-50">
                {savingGeneric ? 'Saving...' : 'Save'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {selectedGeneric && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 select-none font-sans">
          <section className="flex max-h-[88vh] w-[1120px] max-w-[97vw] flex-col overflow-hidden border-2 border-slate-600 bg-[#ece9d8] text-xs text-slate-800 shadow-2xl">
            <header className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
              <span>Stock Detail - {selectedGeneric.genericName}</span>
              <button onClick={() => setSelectedGeneric(null)} aria-label="Close stock detail" className="px-1 hover:bg-rose-600">×</button>
            </header>
            <div className="flex items-center justify-between border-b border-slate-300 bg-[#f0f0f0] px-2 py-1">
              <button onClick={() => setSelectedGeneric(null)} className="underline hover:bg-blue-100">Back to Generic Name</button>
              <span>{selectedGeneric.brands.length} brand{selectedGeneric.brands.length === 1 ? '' : 's'}</span>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead className="sticky top-0 bg-[#ece9d8]">
                  <tr className="border-b border-slate-500">
                    {['Code', 'Particular', 'WSU', 'Min', 'Bo', 'Rack No.', 'Unit', 'Qty', 'C price', 'MRP', 'S price', 'With Tax', 'Mfg / Life'].map((heading) => (
                      <th key={heading} className="whitespace-nowrap border-r border-slate-300 px-2 py-1">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedGeneric.brands.map((brand) => (
                    <tr key={brand._id} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="whitespace-nowrap px-2 py-1">{brand.mdCode}</td>
                      <td className="min-w-56 px-2 py-1 font-semibold">{brand.brandName}</td>
                      <td className="px-2 py-1 text-right">{brand.wsUnit || 1}</td>
                      <td className="px-2 py-1 text-right">{brand.roLevel || 0}</td>
                      <td className="px-2 py-1 text-right">{brand.bonus || 0}</td>
                      <td className="px-2 py-1">{brand.rackNo || ''}</td>
                      <td className="px-2 py-1">{brand.unit || 'TAB'}</td>
                      <td className="px-2 py-1 text-right">{brand.currentStock}</td>
                      <td className="px-2 py-1 text-right">{formatAmount(brand.cPrice)}</td>
                      <td className="px-2 py-1 text-right">{formatAmount(brand.mrp)}</td>
                      <td className="px-2 py-1 text-right">{formatAmount(brand.sPrice)}</td>
                      <td className="px-2 py-1 text-right">{formatAmount((Number(brand.sPrice) || 0) * (1 + (Number(brand.vatPercent) || 0) / 100))}</td>
                      <td className="px-2 py-1 text-right">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!selectedGeneric.brands.length && <p className="p-6 text-center text-slate-500">No brands are linked to this generic medicine.</p>}
            </div>
            <footer className="flex justify-end border-t border-slate-300 p-2">
              <button onClick={() => setSelectedGeneric(null)} className="border border-slate-500 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] px-4 py-1 font-bold">Close</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
