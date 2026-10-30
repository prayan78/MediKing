import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, Settings2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SystemSettings() {
  const { setDateSystem } = useAuth();
  const [hospitalName, setHospitalName] = useState('');
  const [selectedDateSystem, setSelectedDateSystem] = useState(dateSystem);
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        setHospitalName(data.data.hospitalName || '');
        setSelectedDateSystem(data.data.dateSystem || 'AD');
        setSettingsLoaded(true);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load system settings.'))
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data } = await api.put('/settings', { dateSystem: selectedDateSystem, hospitalName });
      setDateSystem(data.data.dateSystem);
      setNotice('System settings saved. The selected date system now applies across the workspace.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading settings…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">Workspace configuration</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">System settings</h1>
        <p className="mt-2 text-sm text-teal-50/80">Configure the hospital identity and date format used across the system.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{notice}</div>}

      <form onSubmit={saveSettings} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800"><Settings2 size={20} /></div>
            <div><h2 className="font-semibold text-slate-900">Hospital identity</h2><p className="text-xs text-slate-500">Shown across hospital workspaces and reports.</p></div>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Hospital name
            <input value={hospitalName} onChange={(event) => setHospitalName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" />
          </label>
        </section>

        <section className="border-t border-slate-100 pt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-800"><CalendarDays size={20} /></div>
            <div><h2 className="font-semibold text-slate-900">System date</h2><p className="text-xs text-slate-500">Choose the calendar for date displays and date entry.</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['AD', 'English date (A.D.)', 'Gregorian calendar · e.g. 30/10/2026'],
              ['BS', 'Nepali date (B.S.)', 'Bikram Sambat · e.g. 13 Kartik 2083'],
            ].map(([value, label, description]) => (
              <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${selectedDateSystem === value ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/10' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="dateSystem" value={value} checked={selectedDateSystem === value} onChange={() => setSelectedDateSystem(value)} className="mt-1 accent-teal-700" />
                <span><span className="block text-sm font-semibold text-slate-900">{label}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Dates remain stored in Gregorian (A.D.) format in the database; the selected calendar controls how dates are shown and entered.</p>
        </section>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button disabled={saving || !settingsLoaded} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            <Check size={16} /> {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
