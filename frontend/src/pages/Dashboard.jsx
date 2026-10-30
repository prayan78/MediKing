import React, { useState, useEffect } from 'react';
import MediProWorkspace from '../components/medipro/MediProWorkspace';
import ApplicationLauncher from '../components/medipro/ApplicationLauncher';
import AttendanceWorkspace from '../components/medipro/AttendanceWorkspace';
import AccountWorkspace from '../components/medipro/AccountWorkspace';
import {
  Users,
  Stethoscope,
  Pill,
  CreditCard,
  FlaskConical,
  Boxes,
  AlertTriangle,
  Clock,
  RefreshCw,
  PlusCircle,
  Printer,
  ChevronRight,
  TrendingUp,
  Building2,
  Calendar,
  Sparkles,
  Sliders,
  FileText,
  CheckCircle2,
  Monitor,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatSystemDate } from '../utils/nepaliDate';

export default function Dashboard() {
  const { currentBranch, user } = useAuth();
  const outletContext = useOutletContext();
  const onOpenNewPatient = outletContext?.onOpenNewPatient;
  const onOpenProductList = outletContext?.onOpenProductList;
  const onOpenDrugSetup = outletContext?.onOpenDrugSetup;

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('mediking_view_mode') || 'launcher';
  });

  const handleSwitchMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('mediking_view_mode', mode);
    window.dispatchEvent(new CustomEvent('view-mode-changed', { detail: mode }));
  };

  useEffect(() => {
    const handleModeChange = (e) => {
      setViewMode(e.detail || localStorage.getItem('mediking_view_mode') || 'launcher');
    };
    window.addEventListener('view-mode-changed', handleModeChange);
    return () => window.removeEventListener('view-mode-changed', handleModeChange);
  }, []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const branchParam = currentBranch?._id ? `?branchId=${currentBranch._id}` : '';
      const res = await api.get(`/dashboard${branchParam}`);
      setData(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Unable to load dashboard metrics from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handlePatientCreated = () => fetchDashboardData();
    window.addEventListener('patient-created', handlePatientCreated);
    return () => window.removeEventListener('patient-created', handlePatientCreated);
  }, [currentBranch]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formattedDate = formatSystemDate(currentTime, { weekday: 'long' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const { summary, lowStockAlerts, expiryAlerts, activeOpdQueue, recentPharmacySales } = data || {};

  // When in MediPro desktop mode, render the full-screen desktop workspace (Image 1)
  if (viewMode === 'launcher') {
    return <ApplicationLauncher onSelect={handleSwitchMode} />;
  }

  if (viewMode === 'attendance') {
    return <AttendanceWorkspace onBackToLauncher={() => handleSwitchMode('launcher')} />;
  }

  if (viewMode === 'account') {
    return <AccountWorkspace onBackToLauncher={() => handleSwitchMode('launcher')} />;
  }

  if (viewMode === 'medipro') {
    return (
      <MediProWorkspace
        onSwitchToModern={() => handleSwitchMode('modern')}
        onSwitchToLauncher={() => handleSwitchMode('launcher')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Hero Hospital & Live Operations Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-2xl shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono tracking-wider">
                MEDIKING HEALTH SYSTEMS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE DB ACTIVE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              {currentBranch?.name || 'MediKing Central Hospital (Kathmandu)'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Integrated Pharmacy ERP, OPD Consultation Queue, Inpatient Ward Management & Diagnostic Laboratory
            </p>
          </div>

          {/* Clock & Action Launchers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            {/* Live Clock & Nepali Date Widget */}
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-inner text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="font-mono text-lg font-black text-teal-400 tracking-wider">
                  {formattedTime}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 justify-end mt-0.5">
                <span>{formattedDate} ({localStorage.getItem('mediking_date_system') || 'AD'})</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleSwitchMode('medipro')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition border border-blue-400/30"
                title="Switch back to Original MediPro Desktop Dashboard"
              >
                <Monitor size={15} className="text-yellow-300" />
                <span>Original Dashboard</span>
              </button>

              {onOpenProductList && (
                <button
                  onClick={onOpenProductList}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-teal-500/10 transition"
                  title="Open Master Medicine Catalog"
                >
                  <Pill size={15} />
                  <span>Product Catalog (F3)</span>
                </button>
              )}

              {onOpenDrugSetup && (
                <button
                  onClick={onOpenDrugSetup}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition"
                  title="Open Drug Setup Categories"
                >
                  <Sliders size={14} className="text-teal-400" />
                  <span>Drug Setup</span>
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition disabled:opacity-50"
                title="Refresh Metrics"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline font-bold">Retry Sync</button>
        </div>
      )}

      {/* 2. Primary KPI Cards Grid (Zero empty spaces) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pharmacy Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pharmacy Sales Today</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
              <Pill size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rs. {Number(summary?.pharmacy?.todayRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{summary?.pharmacy?.salesCount || 0} Invoices Billed</span>
            <span className="text-emerald-700 font-bold">Paid: Rs. {summary?.pharmacy?.todayPaid || 0}</span>
          </div>
        </div>

        {/* Card 2: OPD Encounters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OPD Consultation Queue</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
              <Stethoscope size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary?.opdSummary?.total || 0}
            </span>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              {summary?.opdSummary?.waiting || 0} In Waiting Room
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>In Consultation: <strong>{summary?.opdSummary?.inConsultation || 0}</strong></span>
            <span className="text-emerald-600 font-bold">Done: {summary?.opdSummary?.completed || 0}</span>
          </div>
        </div>

        {/* Card 3: Inventory Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Valuation (MRP)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
              <Boxes size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rs. {Number(summary?.inventory?.totalInventoryValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cost: Rs. {Number(summary?.inventory?.totalPurchaseValue || 0).toLocaleString('en-IN')}</span>
            <button
              onClick={onOpenProductList}
              className="text-teal-600 hover:underline font-bold text-xs"
            >
              View 39+ Products →
            </button>
          </div>
        </div>

        {/* Card 4: Patients Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Registrations</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary?.todayPatients || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">registered today</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total MRNs on Record</span>
            <span className="font-bold text-slate-800">{summary?.totalPatients || 0} Patients</span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lab Workload */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FlaskConical size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Diagnostic Lab Workload</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {summary?.labSummary?.total || 0} Total Tests Registered
              </div>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              {summary?.labSummary?.pending || 0} Pending
            </span>
          </div>
        </div>

        {/* Customer Credit (Udharo) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Customer Credit (Udharo)</div>
              <div className="text-base font-bold text-rose-600 mt-0.5 font-mono">
                Rs. {Number(summary?.outstandingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-1 rounded-md border border-rose-100">
            Due Ledger
          </span>
        </div>

        {/* Near Expiry Medicines Alert */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expiring Batches (&lt; 90 Days)</div>
              <div className="text-base font-bold text-orange-600 mt-0.5 font-mono">
                {summary?.inventory?.nearExpiryCount || 0} Batches
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-1 rounded-md border border-orange-100">
            Expiry-First
          </span>
        </div>
      </div>

      {/* 4. Main Operations Grid (OPD Queue, Quick Launchpad, Stock Watch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 of 12 cols): OPD Queue & Recent Invoices */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active OPD Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Today's OPD Queue & Consultation Status</h2>
                  <p className="text-[11px] text-slate-400">Real-time doctor assignment, token sequence & patient vitals</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/50">
                {activeOpdQueue?.length || 0} In Queue
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 w-16">Token</th>
                    <th className="py-2.5 px-4">Patient Information</th>
                    <th className="py-2.5 px-4">Doctor & Department</th>
                    <th className="py-2.5 px-4">Vitals</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!activeOpdQueue || activeOpdQueue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No active OPD tokens registered for today yet.
                      </td>
                    </tr>
                  ) : (
                    activeOpdQueue.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-teal-700 text-sm">
                          #{item.tokenNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.patient?.fullName || 'Walk-in'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.patient?.mrn} • {item.patient?.age}Y/{item.patient?.gender?.charAt(0)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {item.doctor?.user?.name || 'Consultant Physician'}
                          </div>
                          <div className="text-[11px] text-slate-400">{item.department?.name || 'General OPD'}</div>
                        </td>
                        <td className="py-3 px-4 text-[11px] font-mono text-slate-600">
                          {item.vitals?.bloodPressure ? (
                            <span>BP: {item.vitals.bloodPressure} | {item.vitals.pulseRate} bpm</span>
                          ) : (
                            <span className="text-slate-400">Vitals Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.status === 'in_consultation' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                              In Consultation
                            </span>
                          )}
                          {item.status === 'waiting' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Waiting
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Pharmacy Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pill size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Recent Pharmacy Invoices (MediKing POS)</h2>
                  <p className="text-[11px] text-slate-400">Live dispensed prescription bills with tax invoices</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">Today's Transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Customer / Patient</th>
                    <th className="py-2.5 px-4">Items</th>
                    <th className="py-2.5 px-4 text-right">Net Amount</th>
                    <th className="py-2.5 px-4 text-center">Payment</th>
                    <th className="py-2.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!recentPharmacySales || recentPharmacySales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No pharmacy transactions recorded today yet.
                      </td>
                    </tr>
                  ) : (
                    recentPharmacySales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {sale.invoiceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sale.customerName}</div>
                          {sale.patient?.mrn && (
                            <div className="text-[10px] text-teal-600 font-mono">{sale.patient.mrn}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                            {sale.items?.length || 0} items
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                          Rs. {sale.netAmount?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="capitalize text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium border border-teal-100">
                            {sale.paymentMethod?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(sale)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            <Printer size={13} />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12 cols): Quick Catalogue Matrix & Stock Alerts (No empty space!) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Catalogue & Operations Launchpad */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Boxes size={15} className="text-teal-600" />
              <span>Pharmacy & Master Launchpad</span>
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={onOpenProductList}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200/80 text-left transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition">
                    <Pill size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Product Setup Catalog</div>
                    <div className="text-[10px] text-slate-500">39+ DDA medicines, rates & batches</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                  F3
                </span>
              </button>

              <button
                onClick={onOpenDrugSetup}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Drug Setup Categories</div>
                    <div className="text-[10px] text-slate-500">Companies, generics, racks & discounts</div>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={onOpenNewPatient}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Register New Patient</div>
                    <div className="text-[10px] text-slate-500">Instant MRN generation & OPD entry</div>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* Near Expiry Batches Watchlist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-orange-500" />
                <span>Near-Expiry Watchlist (&lt; 90 Days)</span>
              </h3>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                Expiry-First
              </span>
            </div>

            <div className="space-y-2">
              {!expiryAlerts || expiryAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No batches expiring in next 90 days.</p>
              ) : (
                expiryAlerts.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{b.medicineName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Batch: {b.batchNumber} • Stock: <span className="font-bold text-orange-800">{b.stock} units</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-900">
                        {formatSystemDate(b.expiryDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Reorder Thresholds */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-rose-500" />
                <span>Low Stock Reorder Alerts</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                Reorder
              </span>
            </div>

            <div className="space-y-2">
              {!lowStockAlerts || lowStockAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">All medicines are above safety stock levels.</p>
              ) : (
                lowStockAlerts.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{m.brandName}</div>
                      <div className="text-[11px] text-slate-500">{m.genericName} ({m.dosageForm})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-rose-700">
                        {m.currentStock} units left
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {m.minStockAlert}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal (MediKing Brand with PAN/VAT) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 text-center bg-slate-50/60">
              <h3 className="font-black text-base text-slate-900 uppercase tracking-wide">
                {currentBranch?.name || 'MediKing Hospital & Research Centre'}
              </h3>
              <p className="text-[11px] text-slate-500">Tripureshwor, Kathmandu, Nepal</p>
              <p className="text-[11px] text-slate-500">PAN No: 602345891 • DDA Reg: DDA-REG-KT-2024-88</p>
              <div className="mt-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono font-bold text-teal-800">
                PHARMACY CASH TAX INVOICE
              </div>
            </div>

            <div className="p-6 text-xs space-y-3 font-mono">
              <div className="flex justify-between">
                <span>Invoice: <strong>{selectedReceipt.invoiceNumber}</strong></span>
                <span>Date: {formatSystemDate(selectedReceipt.saleDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer: {selectedReceipt.customerName}</span>
                <span>Payment: {selectedReceipt.paymentMethod}</span>
              </div>

              <table className="w-full border-t border-b border-slate-200 py-2 my-2">
                <thead>
                  <tr className="text-left text-slate-500 text-[10px]">
                    <th className="py-1">Item / Batch</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceipt.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1">
                        <div>{it.medicineName}</div>
                        <div className="text-[9px] text-slate-400">B: {it.batchNumber}</div>
                      </td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">{it.unitPrice.toFixed(2)}</td>
                      <td className="py-1 text-right font-bold">{it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right text-xs pt-1">
                <div>Subtotal: Rs. {selectedReceipt.totalAmount?.toFixed(2)}</div>
                <div>Discount: Rs. {selectedReceipt.discountAmount?.toFixed(2)}</div>
                <div className="text-sm font-bold border-t border-slate-200 pt-1 text-slate-900">
                  Net Payable: Rs. {selectedReceipt.netAmount?.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
