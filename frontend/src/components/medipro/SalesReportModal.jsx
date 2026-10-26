import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { getBikramSambatDate } from '../../utils/nepaliDate';

const REPORT_OPTIONS = [
  { id: 'sales_register', label: 'Sales Register', supported: true },
  { id: 'datewise_summary', label: 'Datewise Sales Summary' },
  { id: 'userwise_summary', label: 'Userwise Sales Summary' },
  { id: 'partywise_summary', label: 'Partywise Sales Summary' },
  { id: 'category_summary', label: 'Productwise Sales By Category' },
  { id: 'areawise_summary', label: 'Areawise Sales Summary' },
  { id: 'mrwise_summary', label: 'MRwise Sales Summary' },
  { id: 'sales_summary', label: 'Sales Summary', supported: true },
  { id: 'insurance_sales', label: 'Insurance Sales Report' },
  { id: 'sales_book', label: 'Sales Book All (Materialized View)', dividerBefore: true },
  { id: 'sales_vat', label: 'Sales Vat Register' },
  { id: 'sales_vat_summary', label: 'Sales Vat Register Summary' },
  { id: 'net_sales', label: 'Net Sales' },
  { id: 'product_summary', label: 'Productwise Summary', dividerBefore: true },
  { id: 'salesman_report', label: 'Sales Man Report' },
  { id: 'salesman_product', label: 'Sales Man Vs Product Report' },
  { id: 'monthly_sales', label: 'Monthly Sales' },
  { id: 'mr_product', label: 'MRwise Product', dividerBefore: true },
  { id: 'company_mr', label: 'Sales Statement Company/MR' },
  { id: 'company_book', label: 'Companywise Sales Book' },
  { id: 'territory_product', label: 'Sales By M.R. Territory/Product' },
  { id: 'product_monthly', label: 'Productwise Monthly Sales' },
  { id: 'product_party', label: 'Product Vs Party' },
  { id: 'sales_flash', label: 'Sales Flash' },
  { id: 'mr_sales', label: 'MR Sales Report' },
  { id: 'net_sales_party', label: 'Net Sales - All Credit + Cash Party' },
];

const formatBsDate = (date) => {
  const bs = getBikramSambatDate(date);
  return `${bs.year}/${String(bs.month + 1).padStart(2, '0')}/${String(bs.day).padStart(2, '0')}`;
};

const compareDates = (left, right) => left.localeCompare(right);
const amount = (value) => (Number(value) || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function SalesReportModal({ isOpen, onClose }) {
  const [selectedReport, setSelectedReport] = useState('sales_summary');
  const [activeTab, setActiveTab] = useState('Sales');
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [dateType, setDateType] = useState('BS');
  const [byDateMonth, setByDateMonth] = useState('Date');
  const [fromDate, setFromDate] = useState(() => formatBsDate(new Date()));
  const [toDate, setToDate] = useState(() => formatBsDate(new Date()));
  const [draftFromDate, setDraftFromDate] = useState(fromDate);
  const [draftToDate, setDraftToDate] = useState(toDate);
  const [functionType, setFunctionType] = useState('Cash');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !reportOpen) return undefined;

    let cancelled = false;
    const loadSales = async () => {
      setLoading(true);
      setError('');
      try {
        const records = [];
        let page = 1;
        let total = 0;
        do {
          const response = await api.get('/sales', {
            params: { page, limit: 500 },
          });
          records.push(...(response.data.data || []));
          total = response.data.pagination?.total ?? records.length;
          page += 1;
        } while (!cancelled && records.length < total);
        if (!cancelled) setSales(records);
      } catch (loadError) {
        console.error('Failed to load sales register:', loadError);
        if (!cancelled) setError('Failed to load sales from the database.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSales();
    return () => {
      cancelled = true;
    };
  }, [isOpen, reportOpen]);

  const filteredSales = useMemo(() => sales.filter((sale) => {
    if (activeTab !== 'Sales') return false;
    if (functionType === 'Credit' && sale.paymentMethod !== 'credit_udharo') return false;
    if (functionType === 'Cash' && sale.paymentMethod === 'credit_udharo') return false;
    if (!['Cash', 'Credit'].includes(functionType)) return false;
    const saleDate = new Date(sale.saleDate);
    if (Number.isNaN(saleDate.getTime())) return false;
    const formattedDate = dateType === 'BS'
      ? formatBsDate(saleDate)
      : saleDate.toISOString().slice(0, 10);
    const start = byDateMonth === 'Month' ? fromDate.slice(0, 7) : fromDate;
    const end = byDateMonth === 'Month' ? toDate.slice(0, 7) : toDate;
    const selected = byDateMonth === 'Month' ? formattedDate.slice(0, 7) : formattedDate;
    return compareDates(selected, start) >= 0 && compareDates(selected, end) <= 0;
  }), [sales, activeTab, functionType, dateType, byDateMonth, fromDate, toDate]);

  const totals = useMemo(() => filteredSales.reduce((result, sale) => ({
    sales: result.sales + (Number(sale.totalAmount) || 0),
    discount: result.discount + (Number(sale.discountAmount) || 0),
    net: result.net + (Number(sale.netAmount) || 0),
    cash: result.cash + (sale.paymentMethod === 'cash' ? Number(sale.paidAmount || sale.netAmount) : 0),
    card: result.card + (sale.paymentMethod === 'bank_card' || sale.paymentMethod === 'fonepay_qr' ? Number(sale.paidAmount || sale.netAmount) : 0),
  }), { sales: 0, discount: 0, net: 0, cash: 0, card: 0 }), [filteredSales]);

  if (!isOpen) return null;

  const openDateRange = () => {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setDateRangeOpen(true);
  };

  const setDateRange = () => {
    const datePattern = dateType === 'BS' ? /^\d{4}\/\d{2}\/\d{2}$/ : /^\d{4}-\d{2}-\d{2}$/;
    const normalizedFrom = byDateMonth === 'Month' ? draftFromDate.trim().slice(0, 7) : draftFromDate.trim();
    const normalizedTo = byDateMonth === 'Month' ? draftToDate.trim().slice(0, 7) : draftToDate.trim();
    const monthPattern = dateType === 'BS' ? /^\d{4}\/\d{2}$/ : /^\d{4}-\d{2}$/;
    const isValid = byDateMonth === 'Month'
      ? monthPattern.test(normalizedFrom) && monthPattern.test(normalizedTo)
      : datePattern.test(normalizedFrom) && datePattern.test(normalizedTo);
    if (!isValid
      || compareDates(draftFromDate, draftToDate) > 0) {
      setError(`Enter a valid ${dateType} ${byDateMonth.toLowerCase()} range. The From date must not be after the To date.`);
      return;
    }
    setFromDate(normalizedFrom);
    setToDate(normalizedTo);
    setError('');
    setDateRangeOpen(false);
    setReportOpen(true);
  };

  const changeDateType = (value) => {
    setDateType(value);
    if (value === 'AD') {
      const today = new Date().toISOString().slice(0, 10);
      setFromDate(today);
      setToDate(today);
      setDraftFromDate(today);
      setDraftToDate(today);
    } else {
      const today = formatBsDate(new Date());
      setFromDate(today);
      setToDate(today);
      setDraftFromDate(today);
      setDraftToDate(today);
    }
  };

  const dismissReport = () => {
    setReportOpen(false);
    setError('');
  };

  return (
    <>
      {!reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 select-none font-sans">
          <div className="relative flex max-h-[90vh] w-[390px] max-w-[95vw] flex-col border-2 border-slate-600 bg-[#ece9d8] text-xs text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
              <span>Sales / Sales-Return Register</span>
              <button onClick={onClose} aria-label="Close" className="border border-slate-600 bg-[#ece9d8] px-1 font-bold text-slate-900 hover:bg-rose-600 hover:text-white">×</button>
            </div>
            <div className="border-b border-slate-300 bg-[#f0f0f0] px-2 py-1 text-[11px]">Function</div>
            <div className="flex gap-3 border-b border-slate-400 bg-[#dfdbcd] px-3 py-1">
              {['Cash', 'Credit', 'Super', 'Issue', '(CP)'].map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-1">
                  <input type="radio" name="sales-function" checked={functionType === type} onChange={() => setFunctionType(type)} />
                  {type}
                </label>
              ))}
            </div>
            <div className="flex border-b border-slate-400 bg-[#dfdbcd] px-2 pt-1">
              {['Sales', 'Sales Return'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`border-x border-t border-slate-500 px-3 py-1 ${activeTab === tab ? 'bg-[#ece9d8] font-bold' : 'bg-[#cfcbbe]'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="min-h-64 flex-1 space-y-0.5 overflow-y-auto px-5 py-3">
              {REPORT_OPTIONS.map((report) => (
                <React.Fragment key={report.id}>
                  {report.dividerBefore && <div className="my-1 border-t border-slate-500" />}
                  <label className={`flex items-center gap-2 py-0.5 ${report.supported ? 'cursor-pointer' : 'cursor-not-allowed text-slate-400'}`}>
                    <input
                      type="radio"
                      name="sales-report"
                      checked={report.supported && selectedReport === report.id}
                      disabled={!report.supported}
                      onClick={() => {
                        setSelectedReport(report.id);
                        openDateRange();
                      }}
                      onChange={() => setSelectedReport(report.id)}
                    />
                    <span className={selectedReport === report.id ? 'font-bold text-blue-950' : ''}>{report.label}</span>
                  </label>
                </React.Fragment>
              ))}
            </div>
            {error && <p role="alert" className="px-3 pb-2 text-rose-700">{error}</p>}
            <div className="flex justify-center gap-4 border-t border-slate-300 p-2">
              <button onClick={openDateRange} className="w-24 border border-slate-500 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] py-1 font-bold">Select</button>
              <button onClick={onClose} className="w-24 border border-slate-500 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] py-1 font-bold">Close</button>
            </div>

            {dateRangeOpen && (
              <div className="absolute left-1/2 top-1/2 z-10 w-56 -translate-x-1/2 -translate-y-1/2 border-2 border-slate-600 bg-[#ece9d8] text-xs shadow-xl">
                <div className="bg-[#2b4c7e] px-2 py-1 font-bold text-white">Date Range</div>
                <div className="border-b border-slate-300 bg-[#f0f0f0] px-2 py-0.5 text-[10px]">Function</div>
                <div className="space-y-1.5 p-2">
                  <label className="flex items-center justify-between gap-2"><span className="font-semibold">Date Type</span>
                    <select value={dateType} onChange={(event) => changeDateType(event.target.value)} className="w-24 border border-slate-400 bg-white px-1 py-0.5">
                      <option value="BS">BS</option><option value="AD">AD</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-2"><span className="font-semibold">By Date/Month</span>
                    <select value={byDateMonth} onChange={(event) => setByDateMonth(event.target.value)} className="w-24 border border-slate-400 bg-white px-1 py-0.5">
                      <option value="Date">Date</option><option value="Month">Month</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-2"><span className="font-semibold">From</span>
                    <input value={draftFromDate} onChange={(event) => setDraftFromDate(event.target.value)} className="w-24 border border-slate-400 bg-white px-1 py-0.5 font-mono" />
                  </label>
                  <label className="flex items-center justify-between gap-2"><span className="font-semibold">To</span>
                    <input value={draftToDate} onChange={(event) => setDraftToDate(event.target.value)} className="w-24 border border-slate-400 bg-white px-1 py-0.5 font-mono" />
                  </label>
                  <button onClick={setDateRange} className="w-full border border-slate-500 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] py-1 font-bold">Set</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 select-none font-sans">
          <section className="flex max-h-[96vh] w-[1180px] max-w-[98vw] flex-col overflow-hidden border-2 border-slate-600 bg-[#ece9d8] text-xs text-slate-800 shadow-2xl">
            <header className="flex items-center justify-between bg-[#2b4c7e] px-2 py-1 font-bold text-white">
              <span>{activeTab === 'Sales Return'
                ? selectedReport === 'sales_summary' ? 'Sales Return Summary' : 'Sales Return Register'
                : selectedReport === 'sales_summary' ? 'Sales Summary' : 'Cash Sales Book'}</span>
              <button onClick={dismissReport} aria-label="Close report" className="border border-slate-600 bg-[#ece9d8] px-1 font-bold text-slate-900 hover:bg-rose-600 hover:text-white">×</button>
            </header>
            <div className="flex items-center gap-3 border-b border-slate-300 bg-[#f0f0f0] px-2 py-1 text-[11px]">
              <button onClick={() => window.print()} className="font-semibold underline">Report</button>
              <button onClick={dismissReport} className="font-semibold underline">Close</button>
              <span className="ml-auto">Date: {fromDate} — {toDate}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-slate-300 p-2">
              <button onClick={openDateRange} className="border border-slate-500 bg-white px-3 py-1 font-bold">Date Range</button>
              <span>From: {fromDate}</span><span>To: {toDate}</span>
            </div>
            {dateRangeOpen && (
              <div className="absolute left-1/2 top-1/2 z-[70] w-56 -translate-x-1/2 -translate-y-1/2 border-2 border-slate-600 bg-[#ece9d8] shadow-xl">
                <div className="bg-[#2b4c7e] px-2 py-1 font-bold text-white">Date Range</div>
                <div className="space-y-2 p-2">
                  <label className="flex items-center justify-between">Date Type
                    <select value={dateType} onChange={(event) => changeDateType(event.target.value)} className="border border-slate-400 bg-white"><option value="BS">BS</option><option value="AD">AD</option></select>
                  </label>
                  <label className="flex items-center justify-between">From<input value={draftFromDate} onChange={(event) => setDraftFromDate(event.target.value)} className="w-24 border border-slate-400 bg-white px-1" /></label>
                  <label className="flex items-center justify-between">To<input value={draftToDate} onChange={(event) => setDraftToDate(event.target.value)} className="w-24 border border-slate-400 bg-white px-1" /></label>
                  <button onClick={setDateRange} className="w-full border border-slate-500 bg-white py-1 font-bold">Set</button>
                </div>
              </div>
            )}
            {error ? <p role="alert" className="p-4 text-rose-700">{error}</p> : loading ? <p className="p-8 text-center">Loading sales...</p> : (
              selectedReport === 'sales_summary' ? (
                <div className="flex-1 overflow-auto bg-white p-4">
                  <h2 className="text-center text-lg font-semibold">{activeTab === 'Sales Return' ? 'Sales Return Summary' : 'Sales Summary'}</h2>
                  <p className="mb-3 text-center">From: {fromDate} To: {toDate}</p>
                  <table className="w-full border-collapse text-left">
                    <thead><tr className="border-y border-slate-500 bg-[#ece9d8]">
                      {['Type', 'Sales', 'Discount', 'Net Sales', 'Return', 'Return Dis', 'Net Return', 'Credit Note', 'Debit Note', 'Total'].map((heading) => <th key={heading} className="p-1 text-right first:text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>
                      {['Credit', 'Cash'].map((type) => {
                        const rows = filteredSales.filter((sale) => (sale.paymentMethod === 'credit_udharo') === (type === 'Credit'));
                        const group = rows.reduce((sum, sale) => ({
                          sales: sum.sales + (Number(sale.totalAmount) || 0),
                          discount: sum.discount + (Number(sale.discountAmount) || 0),
                          net: sum.net + (Number(sale.netAmount) || 0),
                        }), { sales: 0, discount: 0, net: 0 });
                        return <React.Fragment key={type}>
                          <tr><td colSpan="10" className="pt-3 font-semibold underline">{type}</td></tr>
                          {rows.length ? rows.map((sale, index) => <tr key={sale._id}>
                            <td className="p-1">{index + 1}. {sale.customerName || 'Cash Customer'}</td>
                            <td className="p-1 text-right">{amount(sale.totalAmount)}</td>
                            <td className="p-1 text-right">{amount(sale.discountAmount)}</td>
                            <td className="p-1 text-right">{amount(sale.netAmount)}</td>
                            <td className="p-1 text-right">0.00</td><td className="p-1 text-right">0.00</td>
                            <td className="p-1 text-right">0.00</td><td className="p-1 text-right">0.00</td>
                            <td className="p-1 text-right">0.00</td><td className="p-1 text-right">{amount(sale.netAmount)}</td>
                          </tr>) : null}
                          <tr className="border-y border-slate-400 font-semibold"><td className="p-1">Total</td><td className="p-1 text-right">{amount(group.sales)}</td><td className="p-1 text-right">{amount(group.discount)}</td><td className="p-1 text-right">{amount(group.net)}</td><td colSpan="6" className="p-1 text-right">{amount(group.net)}</td></tr>
                        </React.Fragment>;
                      })}
                    </tbody>
                  </table>
                  {activeTab === 'Sales Return' && <p className="mt-4 text-center text-slate-500">Sales return records are not available in the current sales data.</p>}
                  <div className="mt-4 flex justify-between border-t border-slate-500 pt-2 font-bold"><span>Total Sales</span><span>{amount(totals.net)}</span></div>
                  <div className="flex justify-between font-bold"><span>Total Cash Sales</span><span>{amount(totals.cash)}</span></div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead className="sticky top-0 bg-[#ece9d8]"><tr className="border-b border-slate-500">
                      {['Date', 'Inv No', 'Name', 'Amount', 'Discount', 'Vat', 'Vat Free', 'Net', 'Cash', 'Card', 'Copay', 'Username', 'Add'].map((heading) => <th key={heading} className="p-1 text-right first:text-left">{heading}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredSales.map((sale) => <tr key={sale._id} className="border-b border-slate-100 even:bg-slate-50">
                        <td className="p-1">{dateType === 'BS' ? formatBsDate(new Date(sale.saleDate)) : new Date(sale.saleDate).toISOString().slice(0, 10)}</td>
                        <td className="p-1">{sale.invoiceNumber}</td><td className="p-1">{sale.customerName || sale.patient?.fullName || 'Cash Customer'}</td>
                        <td className="p-1 text-right">{amount(sale.totalAmount)}</td><td className="p-1 text-right">{amount(sale.discountAmount)}</td><td className="p-1 text-right">{amount(sale.taxAmount)}</td><td className="p-1 text-right">0.00</td><td className="p-1 text-right">{amount(sale.netAmount)}</td>
                        <td className="p-1 text-right">{sale.paymentMethod === 'cash' ? amount(sale.paidAmount || sale.netAmount) : '0.00'}</td><td className="p-1 text-right">{sale.paymentMethod === 'bank_card' || sale.paymentMethod === 'fonepay_qr' ? amount(sale.paidAmount || sale.netAmount) : '0.00'}</td><td className="p-1 text-right">0.00</td><td className="p-1">{sale.dispensedBy?.name || ''}</td><td className="p-1">{sale.items?.length || 0}</td>
                      </tr>)}
                    </tbody>
                    <tfoot className="sticky bottom-0 bg-[#ece9d8] font-bold"><tr className="border-t border-slate-500"><td colSpan="3" className="p-1 text-right">Total</td><td className="p-1 text-right">{amount(totals.sales)}</td><td className="p-1 text-right">{amount(totals.discount)}</td><td colSpan="2"></td><td className="p-1 text-right">{amount(totals.net)}</td><td className="p-1 text-right">{amount(totals.cash)}</td><td className="p-1 text-right">{amount(totals.card)}</td></tr></tfoot>
                  </table>
                  {activeTab === 'Sales Return' && <p className="p-6 text-center text-slate-500">Sales return records are not available in the current sales data.</p>}
                  {activeTab === 'Sales' && !filteredSales.length && <p className="p-6 text-center text-slate-500">No sales found for the selected date range.</p>}
                </div>
              )
            )}
            <footer className="flex justify-end border-t border-slate-300 p-2"><button onClick={dismissReport} className="border border-slate-500 bg-gradient-to-b from-[#f9f9f9] to-[#dcdcdc] px-5 py-1 font-bold">Close</button></footer>
          </section>
        </div>
      )}
    </>
  );
}
