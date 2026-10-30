import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import SystemDateInput from '../SystemDateInput';
import { formatSystemDate } from '../../utils/nepaliDate';

const REPORT_TYPES = [
  { value: 'general-ledger', label: 'General Ledger' },
  { value: 'sub-group', label: 'Sub-Group Statement' },
  { value: 'group', label: 'Group Statement' },
  { value: 'multiple-ledger', label: 'Multiple General Ledger' },
  { value: 'monthly-balance', label: 'Monthly-wise Ledger Balance' },
];
const amount = (value) => (Number(value) || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const localDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = () => localDateString(new Date());
const startOfYear = () => `${new Date().getFullYear()}-04-01`;

export default function StatementModal({ isOpen, onClose }) {
  const [step, setStep] = useState('options');
  const [firmMode, setFirmMode] = useState('consolidate');
  const [reportType, setReportType] = useState('general-ledger');
  const [grouping, setGrouping] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountCode, setAccountCode] = useState('');
  const [from, setFrom] = useState(startOfYear);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    const loadAccounts = async () => {
      setError('');
      try {
        const response = await api.get('/journal-vouchers/accounts');
        if (!cancelled) setAccounts(response.data.data || []);
      } catch (loadError) {
        console.error('Failed to load statement account heads:', loadError);
        if (!cancelled) setError(loadError.response?.data?.message || 'Could not load account heads.');
      }
    };
    loadAccounts();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const displayedEntries = useMemo(() => {
    if (!report?.entries) return [];
    if (!grouping) return report.entries;
    return [...report.entries].sort((left, right) => left.accountCode.localeCompare(right.accountCode)
      || new Date(left.voucherDate) - new Date(right.voucherDate));
  }, [report, grouping]);

  if (!isOpen) return null;

  const close = () => {
    setStep('options');
    setReport(null);
    setError('');
    onClose();
  };

  const showStatement = async (event) => {
    event.preventDefault();
    if (!from || !to || from > to) {
      setError('Choose a valid date range. The From date must not be after the To date.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/journal-vouchers/statement', {
        params: { from, to, ...(accountCode ? { accountCode } : {}) },
      });
      setReport(response.data.data);
      setStep('report');
    } catch (loadError) {
      console.error('Failed to load general ledger statement:', loadError);
      setError(loadError.response?.data?.message || 'Could not load the statement.');
    } finally {
      setLoading(false);
    }
  };

  const runningBalances = new Map((report?.openingBalances || []).map((opening) => [
    opening.accountCode,
    opening.debit - opening.credit,
  ]));
  if (accountCode && !runningBalances.has(accountCode)) {
    runningBalances.set(accountCode, (report?.openingDebit || 0) - (report?.openingCredit || 0));
  }
  const openingBalance = (report?.openingDebit || 0) - (report?.openingCredit || 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-2 font-sans text-xs text-slate-800">
      <div className={`flex max-h-[94vh] flex-col overflow-hidden border-2 border-slate-600 bg-[#f1f5f9] shadow-2xl ${step === 'report' ? 'w-[1100px] max-w-[98vw]' : 'w-[470px] max-w-[96vw]'}`}>
        <div className="flex items-center justify-between bg-[#0f766e] px-2 py-1 font-bold text-white">
          <span>Statement{step === 'report' ? ' - General Ledger' : ''}</span>
          <button onClick={close} aria-label="Close" className="border border-slate-600 bg-[#f1f5f9] px-1 font-bold text-slate-900 hover:bg-rose-600 hover:text-white">×</button>
        </div>
        {error && <div role="alert" className="border-b border-rose-300 bg-rose-100 px-3 py-2 text-rose-800">{error}</div>}

        {step === 'options' && (
          <>
            <div className="border-b border-slate-300 bg-[#f0f0f0] px-3 py-1">
              <button onClick={close} className="underline hover:text-blue-700">Exit</button>
            </div>
            <div className="space-y-3 p-4">
              <fieldset className="flex gap-6 border border-slate-400 bg-white p-3">
                <legend className="px-1 font-bold">Firm</legend>
                <label className="flex items-center gap-1"><input type="radio" name="firm-mode" checked={firmMode === 'single'} onChange={() => setFirmMode('single')} /> Single Firm</label>
                <label className="flex items-center gap-1"><input type="radio" name="firm-mode" checked={firmMode === 'consolidate'} onChange={() => setFirmMode('consolidate')} /> Consolidate Firm</label>
              </fieldset>
              <fieldset className="space-y-2 border border-slate-400 bg-white p-3">
                <legend className="px-1 font-bold">Statement Type</legend>
                {REPORT_TYPES.map((type) => (
                  <label key={type.value} className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="statement-type" checked={reportType === type.value} onChange={() => setReportType(type.value)} />
                    {type.label}
                  </label>
                ))}
                <label className="ml-6 flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={grouping} onChange={(event) => setGrouping(event.target.checked)} />
                  Grouping
                </label>
              </fieldset>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-300 px-3 py-2">
              <button onClick={() => setStep('filters')} className="min-w-28 border border-blue-800 bg-[#dbeafe] px-4 py-1.5 font-bold hover:bg-blue-100">Statement</button>
              <button onClick={close} className="min-w-24 border border-slate-400 bg-white px-4 py-1.5 hover:bg-slate-100">Close</button>
            </div>
          </>
        )}

        {step === 'filters' && (
          <form onSubmit={showStatement} className="flex flex-col">
            <div className="border-b border-slate-300 bg-[#f0f0f0] px-3 py-1">
              <button type="button" onClick={() => setStep('options')} className="underline hover:text-blue-700">Back</button>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                <span className="font-bold">Date Range</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1">From <SystemDateInput required value={from} onChange={(event) => setFrom(event.target.value)} className="border border-slate-400 bg-white px-2 py-1" /></label>
                  <label className="flex items-center gap-1">To <SystemDateInput required value={to} onChange={(event) => setTo(event.target.value)} className="border border-slate-400 bg-white px-2 py-1" /></label>
                </div>
              </div>
              <label className="grid grid-cols-[90px_1fr] items-center gap-2">
                <span className="font-bold">A/C Head</span>
                <select value={accountCode} onChange={(event) => setAccountCode(event.target.value)} className="border border-slate-400 bg-white px-2 py-1.5">
                  <option value="">All account heads</option>
                  {accounts.map((account) => <option key={account.accountCode} value={account.accountCode}>{account.accountCode} - {account.accountName}</option>)}
                </select>
              </label>
              {accounts.length === 0 && <p className="ml-[98px] text-slate-600">Account heads are created when journal vouchers are posted.</p>}
              <p className="ml-[98px] text-slate-500">Report: {REPORT_TYPES.find((type) => type.value === reportType)?.label} · {firmMode === 'single' ? 'Single Firm' : 'Consolidate Firm'}</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-300 px-3 py-2">
              <button type="submit" disabled={loading} className="min-w-32 border border-blue-800 bg-[#dbeafe] px-4 py-1.5 font-bold hover:bg-blue-100 disabled:opacity-60">{loading ? 'Loading…' : 'Show Statement'}</button>
              <button type="button" onClick={close} className="min-w-24 border border-slate-400 bg-white px-4 py-1.5 hover:bg-slate-100">Close</button>
            </div>
          </form>
        )}

        {step === 'report' && report && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-[#f0f0f0] px-3 py-2">
              <div><strong>Period:</strong> {from} to {to} <span className="ml-2"><strong>Account:</strong> {accountCode || 'All account heads'}</span></div>
              <div className="flex gap-2">
                <button onClick={() => setStep('filters')} className="border border-slate-400 bg-white px-3 py-1 hover:bg-slate-100">Change Filters</button>
                <button onClick={close} className="border border-slate-400 bg-white px-3 py-1 hover:bg-slate-100">Close</button>
              </div>
            </div>
            <div className="overflow-auto bg-white">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead className="sticky top-0 bg-slate-200">
                  <tr>
                    <th className="border border-slate-400 px-2 py-2">Date</th>
                    <th className="border border-slate-400 px-2 py-2">Voucher No.</th>
                    <th className="border border-slate-400 px-2 py-2">A/C Code</th>
                    <th className="border border-slate-400 px-2 py-2">Particular</th>
                    <th className="border border-slate-400 px-2 py-2">Narration</th>
                    <th className="border border-slate-400 px-2 py-2 text-right">Debit</th>
                    <th className="border border-slate-400 px-2 py-2 text-right">Credit</th>
                    <th className="border border-slate-400 px-2 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {accountCode && (
                    <tr className="bg-blue-50 font-semibold">
                      <td colSpan="5" className="border border-slate-300 px-2 py-2">Opening Balance</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{amount(report.openingDebit)}</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{amount(report.openingCredit)}</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{amount(openingBalance)}</td>
                    </tr>
                  )}
                  {!accountCode && report.openingBalances.map((opening) => (
                    <tr key={`opening-${opening.accountCode}`} className="bg-blue-50 font-semibold">
                      <td className="border border-slate-300 px-2 py-2" />
                      <td className="border border-slate-300 px-2 py-2" />
                      <td className="border border-slate-300 px-2 py-2">{opening.accountCode}</td>
                      <td className="border border-slate-300 px-2 py-2">{opening.accountName}</td>
                      <td className="border border-slate-300 px-2 py-2">Opening Balance</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{amount(opening.debit)}</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{amount(opening.credit)}</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{amount(opening.debit - opening.credit)}</td>
                    </tr>
                  ))}
                  {displayedEntries.map((entry, index) => {
                    if (!runningBalances.has(entry.accountCode)) runningBalances.set(entry.accountCode, 0);
                    const balance = runningBalances.get(entry.accountCode) + entry.debit - entry.credit;
                    runningBalances.set(entry.accountCode, balance);
                    const voucherDate = new Date(`${String(entry.voucherDate).slice(0, 10)}T12:00:00`);
                    return (
                      <tr key={`${entry.voucherNo}-${entry.accountCode}-${index}`} className="odd:bg-white even:bg-slate-50">
                        <td className="border border-slate-300 px-2 py-1.5">{formatSystemDate(voucherDate)}</td>
                        <td className="border border-slate-300 px-2 py-1.5">{entry.voucherNo}</td>
                        <td className="border border-slate-300 px-2 py-1.5">{entry.accountCode}</td>
                        <td className="border border-slate-300 px-2 py-1.5">{entry.accountName}</td>
                        <td className="border border-slate-300 px-2 py-1.5">{entry.narration}</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-right">{amount(entry.debit)}</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-right">{amount(entry.credit)}</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-right">{amount(balance)}</td>
                      </tr>
                    );
                  })}
                  {!displayedEntries.length && <tr><td colSpan="8" className="px-3 py-8 text-center text-slate-500">No journal vouchers found for this date range and account.</td></tr>}
                </tbody>
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td colSpan="5" className="border border-slate-400 px-2 py-2 text-right">Period Total</td>
                    <td className="border border-slate-400 px-2 py-2 text-right">{amount(report.totalDebit)}</td>
                    <td className="border border-slate-400 px-2 py-2 text-right">{amount(report.totalCredit)}</td>
                    <td className="border border-slate-400" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
