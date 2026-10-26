import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { getBikramSambatDate } from '../../utils/nepaliDate';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHIFTS = [
  { code: '2', label: 'Double Shift', inTime: '07:00', outTime: '18:00' },
  { code: 'C', label: 'Camp', inTime: '00:00', outTime: '00:00' },
  { code: 'D', label: 'Day Duty', inTime: '09:00', outTime: '17:00' },
  { code: 'E', label: 'Evening', inTime: '13:00', outTime: '18:00' },
  { code: 'F', label: 'Night Off', inTime: '00:00', outTime: '00:00' },
  { code: 'G', label: 'Late Evening', inTime: '12:00', outTime: '21:00' },
  { code: 'H', label: 'Holiday', inTime: '00:00', outTime: '00:00', holiday: true },
  { code: 'I', label: 'Training', inTime: '09:00', outTime: '17:00' },
  { code: 'L', label: 'Leave', inTime: '00:00', outTime: '00:00', leave: true },
  { code: 'M', label: 'Morning', inTime: '07:00', outTime: '13:00' },
  { code: 'N', label: 'Night', inTime: '18:00', outTime: '07:00' },
  { code: 'O', label: 'Day Off', inTime: '00:00', outTime: '00:00', offDay: true },
  { code: 'P', label: 'Public Holiday', inTime: '00:00', outTime: '00:00', holiday: true },
  { code: 'R', label: 'Conference', inTime: '09:00', outTime: '17:00' },
];

const localISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultWeekStart = () => {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay());
  return localISODate(date);
};

const emptyShifts = () => DAYS.map(() => ({
  inTime: '00:00',
  outTime: '00:00',
  shift: 'O',
  offDay: false,
  holiday: false,
  leave: false,
}));

const getWeekDates = (startDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  return DAYS.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const bs = getBikramSambatDate(date);
    return {
      day,
      date,
      bs: `${bs.year}/${String(bs.month + 1).padStart(2, '0')}/${String(bs.day).padStart(2, '0')}`,
    };
  });
};

const shiftSummary = (shift) => {
  if (!shift) return '0';
  if (shift.offDay) return 'O';
  if (shift.holiday) return 'H';
  if (shift.leave) return 'L';
  if (shift.inTime === '00:00' && shift.outTime === '00:00') return '0';
  return `${shift.inTime} - ${shift.outTime}`;
};

export default function WeeklyRosterModal({ isOpen, onClose, initialDepartment = '' }) {
  const [weekStart, setWeekStart] = useState(defaultWeekStart);
  const [department, setDepartment] = useState(initialDepartment);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedRosterEmployeeId, setSelectedRosterEmployeeId] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState('');
  const [editorDepartment, setEditorDepartment] = useState('');
  const [editorShifts, setEditorShifts] = useState(emptyShifts);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const selectedEmployee = roster.find((entry) => entry.employee.id === editingEmployeeId)?.employee;

  const loadRoster = useCallback(async () => {
    if (!weekStart) return;
    try {
      const response = await api.get('/attendance/weekly-roster', { params: { weekStart } });
      setRoster(response.data.data || []);
      setError('');
    } catch (loadError) {
      console.error('Failed to load weekly roster:', loadError);
      setError('Unable to load roster employees and schedules.');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    if (isOpen) loadRoster();
  }, [isOpen, loadRoster]);

  if (!isOpen) return null;

  const openEditor = (entry = null) => {
    setError('');
    setEditingEmployeeId(entry?.employee.id || '');
    setEditorDepartment(entry?.department || department);
    setEditorShifts(entry?.shifts?.length === 7
      ? entry.shifts.map((shift) => ({ ...shift }))
      : emptyShifts());
    setEditorOpen(true);
  };

  const setShiftCode = (dayIndex, code) => {
    const definition = SHIFTS.find((shift) => shift.code === code) || SHIFTS[11];
    setEditorShifts((previous) => previous.map((day, index) => (
      index === dayIndex
        ? {
            ...day,
            inTime: definition.inTime,
            outTime: definition.outTime,
            shift: definition.code,
            offDay: Boolean(definition.offDay),
            holiday: Boolean(definition.holiday),
            leave: Boolean(definition.leave),
          }
        : day
    )));
  };

  const updateShift = (dayIndex, key, value) => {
    setEditorShifts((previous) => previous.map((day, index) => (
      index === dayIndex ? { ...day, [key]: value } : day
    )));
  };

  const saveRoster = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/attendance/weekly-roster', {
        employeeId: editingEmployeeId,
        weekStart,
        department: editorDepartment,
        shifts: editorShifts,
      });
      setEditorOpen(false);
      await loadRoster();
    } catch (saveError) {
      console.error('Failed to save weekly roster:', saveError);
      setError(saveError.response?.data?.message || 'Unable to save weekly roster.');
    } finally {
      setSaving(false);
    }
  };

  const importPreviousWeek = async () => {
    const previous = new Date(`${weekStart}T00:00:00`);
    previous.setDate(previous.getDate() - 7);
    const previousWeekStart = localISODate(previous);
    setSaving(true);
    setError('');
    try {
      const response = await api.get('/attendance/weekly-roster', {
        params: { weekStart: previousWeekStart },
      });
      const previousEntries = (response.data.data || []).filter((entry) => entry.shifts.length === 7);
      await Promise.all(previousEntries.map((entry) => api.put('/attendance/weekly-roster', {
        employeeId: entry.employee.id,
        weekStart,
        department: entry.department || department,
        shifts: entry.shifts,
      })));
      await loadRoster();
    } catch (importError) {
      console.error('Failed to import previous roster:', importError);
      setError(importError.response?.data?.message || 'Unable to import the previous weekly roster.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 font-sans text-xs text-slate-800">
      <section className="flex max-h-[92vh] w-[1120px] max-w-[98vw] flex-col overflow-hidden border-2 border-slate-600 bg-[#ece9d8] shadow-2xl">
        <header className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
          <span>WeeklyRoster_frm</span>
          <button onClick={onClose} aria-label="Close weekly roster" className="px-1 hover:bg-rose-600">×</button>
        </header>
        <div className="flex gap-3 border-b border-slate-300 bg-[#f0f0f0] px-2 py-1">
          <button className="underline hover:bg-blue-100" onClick={() => window.print()}>Report</button>
          <button className="underline hover:bg-blue-100" onClick={onClose}>Exit</button>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-300 p-2">
          <label className="flex flex-col gap-1 font-semibold">Department
            <input value={department} onChange={(event) => setDepartment(event.target.value)} className="w-56 border border-slate-400 bg-white px-2 py-1 font-normal" />
          </label>
          <label className="flex flex-col gap-1 font-semibold">Start Date
            <input type="date" value={weekStart} onChange={(event) => { if (event.target.value) { setLoading(true); setWeekStart(event.target.value); } }} className="border border-slate-400 bg-white px-2 py-1 font-normal" />
          </label>
          <div className="pb-1 text-slate-600">BS Week Start: {weekDates[0].bs}</div>
          <button onClick={importPreviousWeek} disabled={saving} className="ml-auto border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-3 py-1 font-semibold disabled:opacity-50">
            Import Roster From Previous Record
          </button>
          <button
            onClick={() => openEditor(roster.find((entry) => entry.employee.id === selectedRosterEmployeeId))}
            disabled={!selectedRosterEmployeeId || loading}
            className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-3 py-1 font-semibold disabled:opacity-50"
          >
            Edit Roster
          </button>
          <button onClick={() => openEditor()} disabled={loading || roster.length === 0} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-3 py-1 font-bold disabled:opacity-50">
            + Add Roster
          </button>
        </div>
        {error && !editorOpen && <p role="alert" className="border-b border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{error}</p>}
        <div className="min-h-[280px] flex-1 overflow-auto bg-white">
          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading attendance employees...</p>
          ) : (
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 z-10 bg-[#e4e1d1]">
                <tr className="border-b border-slate-500">
                  <th className="whitespace-nowrap border-r border-slate-300 px-2 py-1 text-left">Emp_code</th>
                  <th className="min-w-40 border-r border-slate-300 px-2 py-1 text-left">Employee</th>
                  {weekDates.map((date) => <th key={date.day} className="min-w-24 border-r border-slate-300 px-1 py-1 text-center">{date.day.slice(0, 3)} {date.bs.slice(5)}</th>)}
                </tr>
              </thead>
              <tbody>
                {roster.map((entry) => (
                  <tr
                    key={entry.employee.id}
                    onClick={() => setSelectedRosterEmployeeId(entry.employee.id)}
                    onDoubleClick={() => openEditor(entry)}
                    className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50 ${selectedRosterEmployeeId === entry.employee.id ? 'bg-blue-100' : ''}`}
                    title="Select the employee and choose Edit Roster, or double-click to edit."
                  >
                    <td className="whitespace-nowrap px-2 py-1">{entry.employee.code}</td>
                    <td className="px-2 py-1 font-semibold">{entry.employee.name}</td>
                    {weekDates.map((date, index) => <td key={date.day} className="whitespace-nowrap px-1 py-1 text-center">{shiftSummary(entry.shifts[index])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !roster.length && <p className="p-6 text-center text-slate-500">No active user accounts are assigned to this branch.</p>}
        </div>
        <footer className="flex items-center justify-between border-t border-slate-300 p-2">
          <span className="text-slate-500">Select an employee and choose Edit Roster, or double-click a row.</span>
          <button onClick={onClose} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-4 py-1 font-bold">Close</button>
        </footer>
      </section>

      {editorOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-2 font-sans text-[11px] text-slate-800">
          <form onSubmit={saveRoster} className="flex max-h-[94vh] w-[1050px] max-w-[98vw] flex-col overflow-hidden border-2 border-slate-600 bg-[#ece9d8] shadow-2xl">
            <header className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
              <span>Weekly Roster Setup</span>
              <button type="button" onClick={() => setEditorOpen(false)} aria-label="Close roster editor" className="px-1 hover:bg-rose-600">×</button>
            </header>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 bg-[#f0f0f0] px-2 py-1">
              <button type="button" onClick={() => setEditorOpen(false)} className="underline hover:bg-blue-100">Exit</button>
              <label className="ml-2 flex items-center gap-1">Employee
                <select value={editingEmployeeId} onChange={(event) => setEditingEmployeeId(event.target.value)} required className="max-w-64 border border-slate-400 bg-white px-2 py-1">
                  <option value="">Select employee</option>
                  {roster.map((entry) => <option key={entry.employee.id} value={entry.employee.id}>{entry.employee.code} - {entry.employee.name}</option>)}
                </select>
              </label>
              <span className="font-semibold">{selectedEmployee?.name || ''}</span>
              <span className="ml-auto">Start Date: {weekStart} / {weekDates[0].bs}</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <div className="min-w-[970px]">
                <div className="grid grid-cols-[150px_repeat(7,minmax(112px,1fr))] border-b border-slate-500 bg-[#e4e1d1] font-semibold">
                  <div className="p-1">Day / Date</div>
                  {weekDates.map((date) => <div key={date.day} className="border-l border-slate-300 p-1 text-center">{date.day}<br />{date.bs}</div>)}
                </div>
                <div className="grid grid-cols-[150px_repeat(7,minmax(112px,1fr))]">
                  <div className="space-y-2 p-2 font-semibold">
                    <span>In Time</span><span className="block pt-5">Out Time</span><span className="block pt-5">Shift / Short Key</span>
                  </div>
                  {editorShifts.map((day, index) => (
                    <div key={DAYS[index]} className="space-y-1 border-l border-slate-200 p-1">
                      <input aria-label={`${DAYS[index]} in time`} type="time" value={day.inTime} onChange={(event) => updateShift(index, 'inTime', event.target.value)} className="w-full border border-slate-400 bg-white px-1 py-1" />
                      <input aria-label={`${DAYS[index]} out time`} type="time" value={day.outTime} onChange={(event) => updateShift(index, 'outTime', event.target.value)} className="w-full border border-slate-400 bg-white px-1 py-1" />
                      <select aria-label={`${DAYS[index]} shift`} value={day.shift} onChange={(event) => setShiftCode(index, event.target.value)} className="w-full border border-slate-400 bg-white px-1 py-1">
                        {SHIFTS.map((shift) => <option key={shift.code} value={shift.code}>{shift.code} - {shift.label}</option>)}
                      </select>
                      <div className="space-y-1">
                        {[['offDay', 'Off Day'], ['holiday', 'Holiday'], ['leave', 'Leave']].map(([field, label]) => (
                          <label key={field} className="flex items-center gap-1">
                            <input type="checkbox" checked={day[field]} onChange={(event) => updateShift(index, field, event.target.checked)} />{label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-center">
                <button type="button" onClick={() => setEditorShifts(emptyShifts())} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-4 py-1">Set Default Week</button>
              </div>
              <div className="mt-3">
                <p className="mb-1 font-semibold">Short Keys</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 rounded border border-slate-400 bg-white p-2 sm:grid-cols-3">
                  {SHIFTS.map((shift) => <span key={shift.code}><strong>{shift.code}</strong> &nbsp;{shift.inTime} {shift.outTime} {shift.label}</span>)}
                </div>
              </div>
              {error && <p role="alert" className="mt-2 text-rose-700">{error}</p>}
            </div>
            <footer className="flex justify-end gap-2 border-t border-slate-300 p-2">
              <button type="button" onClick={() => setEditorOpen(false)} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-4 py-1">Cancel</button>
              <button type="submit" disabled={saving} className="border border-slate-500 bg-gradient-to-b from-white to-[#dcdcdc] px-4 py-1 font-bold disabled:opacity-50">{saving ? 'Saving...' : 'Save Roster'}</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
