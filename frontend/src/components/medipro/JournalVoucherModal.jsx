import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { getBikramSambatDate } from '../../utils/nepaliDate';
import SystemDateInput from '../SystemDateInput';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const emptyLine = (defaultDate = '') => ({
  accountCode: '',
  accountName: '',
  narration: '',
  billDate: defaultDate,
  debit: '',
  credit: '',
});
const amount = (value) => (Number(value) || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function JournalVoucherModal({ isOpen, onClose, initialDate }) {
  const getInitialVoucherDate = () => {
    return initialDate || localStorage.getItem('mediking_working_date') || today();
  };
  const [voucherDate, setVoucherDate] = useState(getInitialVoucherDate);
  const [fiscalYear, setFiscalYear] = useState(() => {
    const d = getInitialVoucherDate();
    const bs = getBikramSambatDate(new Date(`${d}T12:00:00`));
    return bs?.year ? `FY${String(bs.year).slice(-2)}${String(bs.year + 1).slice(-2)}` : 'FY8384';
  });
  const [voucherNo, setVoucherNo] = useState('');
  const [lines, setLines] = useState(() => [emptyLine(getInitialVoucherDate()), emptyLine(getInitialVoucherDate())]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    const activeDate = initialDate || localStorage.getItem('mediking_working_date') || today();
    setVoucherDate(activeDate);
    const bs = getBikramSambatDate(new Date(`${activeDate}T12:00:00`));
    if (bs?.year) {
      setFiscalYear(`FY${String(bs.year).slice(-2)}${String(bs.year + 1).slice(-2)}`);
    }
    setLines([emptyLine(activeDate), emptyLine(activeDate)]);

    let cancelled = false;
    const loadFormData = async () => {
      setLoading(true);
      setError('');
      try {
        const [numberResponse, accountResponse] = await Promise.all([
          api.get('/journal-vouchers/next-number'),
          api.get('/journal-vouchers/accounts'),
        ]);
        if (!cancelled) {
          setVoucherNo(numberResponse.data.nextVoucherNo);
          setAccounts(accountResponse.data.data || []);
        }
      } catch (loadError) {
        console.error('Failed to load journal voucher details:', loadError);
        if (!cancelled) setError(loadError.response?.data?.message || 'Could not load journal voucher details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadFormData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialDate]);

  const totals = useMemo(() => lines.reduce((result, line) => ({
    debit: result.debit + (Number(line.debit) || 0),
    credit: result.credit + (Number(line.credit) || 0),
  }), { debit: 0, credit: 0 }), [lines]);

  if (!isOpen) return null;

  const changeLine = (index, field, value) => {
    setLines((current) => current.map((line, lineIndex) => {
      if (lineIndex !== index) return line;
      const updated = { ...line, [field]: value };
      if (field === 'accountCode') {
        const account = accounts.find((item) => item.accountCode.toLowerCase() === value.trim().toLowerCase());
        if (account) updated.accountName = account.accountName;
      }
      return updated;
    }));
  };

  const postVoucher = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const validLines = lines.filter((line) => line.accountCode.trim() || line.accountName.trim()
      || line.debit || line.credit);
    if (validLines.length < 2) {
      setError('Enter at least two journal lines.');
      return;
    }
    if (validLines.some((line) => !line.accountCode.trim() || !line.accountName.trim()
      || (Number(line.debit) > 0) === (Number(line.credit) > 0))) {
      setError('Each line needs an account code, account name, and exactly one positive debit or credit.');
      return;
    }
    if (Math.round(totals.debit * 100) !== Math.round(totals.credit * 100)) {
      setError('Total debit and credit must be equal before posting.');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post('/journal-vouchers', {
        fiscalYear,
        voucherDate,
        voucherDateBs: getBikramSambatDate(new Date(`${voucherDate}T12:00:00`)).numeric,
        lines: validLines,
      });
      setNotice(`Journal voucher ${response.data.data.voucherNo} posted successfully.`);
      setVoucherNo(response.data.data.voucherNo);
      const activeDate = voucherDate || today();
      setLines([emptyLine(activeDate), emptyLine(activeDate)]);
      try {
        const [numberResponse, accountResponse] = await Promise.all([
          api.get('/journal-vouchers/next-number'),
          api.get('/journal-vouchers/accounts'),
        ]);
        setVoucherNo(numberResponse.data.nextVoucherNo);
        setAccounts(accountResponse.data.data || []);
      } catch (refreshError) {
        console.error('Voucher posted, but entry form refresh failed:', refreshError);
        setError('Voucher posted successfully, but account suggestions could not be refreshed. Close and reopen the entry form to refresh.');
      }
    } catch (postError) {
      console.error('Failed to post journal voucher:', postError);
      const responseMessage = postError.response?.data?.message;
      if (responseMessage) {
        setError(responseMessage);
      } else if (postError.response?.status === 404) {
        setError('The journal voucher API route was not found. Restart the backend and try again.');
      } else if (postError.request) {
        setError('Could not reach the backend. Check that the backend is running, then try again.');
      } else {
        setError(postError.message || 'Failed to post journal voucher.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-2 font-sans text-xs text-slate-800">
      <form onSubmit={postVoucher} className="flex max-h-[96vh] w-[1050px] max-w-[98vw] flex-col overflow-hidden border-2 border-slate-600 bg-[#f1f5f9] shadow-2xl">
        <div className="flex items-center justify-between bg-[#0f766e] px-2 py-1 font-bold text-white">
          <span>Journal Voucher Entry</span>
          <button type="button" onClick={onClose} aria-label="Close" className="border border-slate-600 bg-[#f1f5f9] px-1 font-bold text-slate-900 hover:bg-rose-600 hover:text-white">×</button>
        </div>
        <div className="flex items-center gap-4 border-b border-slate-300 bg-[#f0f0f0] px-3 py-1 text-[11px]">
          <span className="font-semibold underline">Function</span>
          <button type="button" onClick={onClose} className="underline hover:text-blue-700">Exit</button>
          <span className="ml-auto text-slate-500">Journal Voucher Entry</span>
        </div>
        {error && <div role="alert" className="border-b border-rose-300 bg-rose-100 px-3 py-2 text-rose-800">{error}</div>}
        {notice && <div role="status" className="border-b border-emerald-300 bg-emerald-100 px-3 py-2 text-emerald-800">{notice}</div>}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-300 p-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 font-bold">
            Fiscal Year
            <select value={fiscalYear} onChange={(event) => setFiscalYear(event.target.value)} className="min-w-28 border border-slate-400 bg-white px-2 py-1 font-normal">
              <option>FY8283</option>
              <option>FY8384</option>
              <option>FY8485</option>
            </select>
          </label>
          <label className="flex items-center gap-2 font-bold">
            Voucher Type
            <input value="JV" readOnly className="w-16 border border-slate-400 bg-slate-100 px-2 py-1 font-mono" />
            <span>Journal Voucher</span>
          </label>
          <label className="flex items-center gap-2 font-bold">
            Voucher No.
            <input value={voucherNo} readOnly className="w-32 border border-slate-400 bg-slate-100 px-2 py-1 font-mono text-blue-900" />
          </label>
          <label className="flex items-center gap-2 font-bold sm:col-span-2">
            Voucher Date
            <SystemDateInput required value={voucherDate} onChange={(event) => setVoucherDate(event.target.value)} className="border border-slate-400 bg-white px-2 py-1 font-normal" />
          </label>
          {loading && <span className="self-center text-slate-500">Loading account heads…</span>}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead className="sticky top-0 bg-slate-200 text-slate-800">
              <tr>
                <th className="border border-slate-400 px-2 py-2">Ac Code</th>
                <th className="border border-slate-400 px-2 py-2">Particular</th>
                <th className="border border-slate-400 px-2 py-2">Narration</th>
                <th className="border border-slate-400 px-2 py-2">Bill Date</th>
                <th className="w-28 border border-slate-400 px-2 py-2 text-right">Debit</th>
                <th className="w-28 border border-slate-400 px-2 py-2 text-right">Credit</th>
                <th className="w-12 border border-slate-400 px-1 py-2" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={`line-${index}`} className="odd:bg-white even:bg-slate-50">
                  <td className="border border-slate-300 p-1">
                    <input list="journal-account-codes" aria-label={`Account code ${index + 1}`} value={line.accountCode} onChange={(event) => changeLine(index, 'accountCode', event.target.value)} className="w-full border border-slate-300 px-1.5 py-1" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input list="journal-account-names" aria-label={`Account name ${index + 1}`} value={line.accountName} onChange={(event) => changeLine(index, 'accountName', event.target.value)} className="w-full border border-slate-300 px-1.5 py-1" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input aria-label={`Narration ${index + 1}`} value={line.narration} onChange={(event) => changeLine(index, 'narration', event.target.value)} className="w-full border border-slate-300 px-1.5 py-1" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <SystemDateInput aria-label={`Bill date ${index + 1}`} value={line.billDate} onChange={(event) => changeLine(index, 'billDate', event.target.value)} className="w-full border border-slate-300 px-1 py-1" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input type="number" min="0" step="0.01" aria-label={`Debit ${index + 1}`} value={line.debit} onChange={(event) => changeLine(index, 'debit', event.target.value)} className="w-full border border-slate-300 px-1.5 py-1 text-right" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input type="number" min="0" step="0.01" aria-label={`Credit ${index + 1}`} value={line.credit} onChange={(event) => changeLine(index, 'credit', event.target.value)} className="w-full border border-slate-300 px-1.5 py-1 text-right" />
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <button type="button" disabled={lines.length <= 2} onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))} aria-label={`Remove line ${index + 1}`} className="rounded border border-slate-300 px-2 py-1 text-rose-700 disabled:opacity-40">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold">
              <tr>
                <td colSpan="4" className="border border-slate-400 px-2 py-2 text-right">Total</td>
                <td className="border border-slate-400 px-2 py-2 text-right">{amount(totals.debit)}</td>
                <td className="border border-slate-400 px-2 py-2 text-right">{amount(totals.credit)}</td>
                <td className="border border-slate-400" />
              </tr>
            </tfoot>
          </table>
          <datalist id="journal-account-codes">
            {accounts.map((account) => <option key={account.accountCode} value={account.accountCode}>{account.accountName}</option>)}
          </datalist>
          <datalist id="journal-account-names">
            {accounts.map((account) => <option key={account.accountCode} value={account.accountName}>{account.accountCode}</option>)}
          </datalist>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-300 bg-[#f1f5f9] px-3 py-2">
          <button type="button" onClick={() => setLines((current) => [...current, emptyLine(voucherDate)])} className="border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-blue-50">Add Line</button>
          <span className={Math.round(totals.debit * 100) === Math.round(totals.credit * 100) ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
            {Math.round(totals.debit * 100) === Math.round(totals.credit * 100) ? 'Balanced' : 'Difference'}: {amount(Math.abs(totals.debit - totals.credit))}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="min-w-24 border border-slate-400 bg-white px-4 py-1.5 hover:bg-slate-100">Close</button>
            <button type="submit" disabled={saving || loading} className="min-w-28 border border-blue-800 bg-[#0f766e] px-4 py-1.5 font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{saving ? 'Posting…' : 'Post Voucher'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
