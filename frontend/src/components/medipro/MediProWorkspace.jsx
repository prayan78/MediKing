import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBikramSambatDate } from '../../utils/nepaliDate';
import DrugSetupModal from './DrugSetupModal';
import ProductListModal from './ProductListModal';
import CompanySetupModal from './CompanySetupModal';
import PurchaseEntryModal from './PurchaseEntryModal';
import PurchaseRegisterModal from './PurchaseRegisterModal';
import PurchaseBookModal from './PurchaseBookModal';
import StockBalanceModal from './StockBalanceModal';
import StockBalanceValuationModal from './StockBalanceValuationModal';
import CashSalesModal from './CashSalesModal';
import UserwiseCashSummaryModal from './UserwiseCashSummaryModal';
import SalesReportModal from './SalesReportModal';
import GenericMedicineModal from './GenericMedicineModal';
import JournalVoucherModal from './JournalVoucherModal';
import StatementModal from './StatementModal';
import {
  Pill,
  ShoppingCart,
  Boxes,
  Receipt,
  Sparkles,
} from 'lucide-react';

export default function MediProWorkspace({ onSwitchToModern, onSwitchToLauncher }) {
  const { currentBranch } = useAuth();

  // Menu dropdown states
  const [activeMenu, setActiveMenu] = useState(null); // 'catalogue', 'purchase', 'sales', 'rep_inv', 'rep_acc', etc.
  const [purchaseSubmenuOpen, setPurchaseSubmenuOpen] = useState(false);
  const [accountVoucherSubmenuOpen, setAccountVoucherSubmenuOpen] = useState(false);

  // Modal open states
  const [drugSetupOpen, setDrugSetupOpen] = useState(false);
  const [productListOpen, setProductListOpen] = useState(false);
  const [companySetupOpen, setCompanySetupOpen] = useState(false);
  const [purchaseEntryOpen, setPurchaseEntryOpen] = useState(false);
  const [purchaseRegisterOpen, setPurchaseRegisterOpen] = useState(false);
  const [purchaseBookOpen, setPurchaseBookOpen] = useState(false);
  const [purchaseBookDateRange, setPurchaseBookDateRange] = useState(null);
  const [stockBalanceOpen, setStockBalanceOpen] = useState(false);
  const [stockValuationOpen, setStockValuationOpen] = useState(false);
  const [goodsSalesSectionOpen, setGoodsSalesSectionOpen] = useState(false);
  const [cashSalesOpen, setCashSalesOpen] = useState(false);
  const [cashSalesReturn, setCashSalesReturn] = useState(false);
  const [forInsurance, setForInsurance] = useState(false);
  const [forSSF, setForSSF] = useState(false);
  const [userwiseCashSummaryOpen, setUserwiseCashSummaryOpen] = useState(false);
  const [salesReportOpen, setSalesReportOpen] = useState(false);
  const [genericMedicineOpen, setGenericMedicineOpen] = useState(false);
  const [journalVoucherOpen, setJournalVoucherOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);

  // Live Clock & Dates
  const [currentTime, setCurrentTime] = useState(new Date());

  const catalogueMenuRef = useRef(null);
  const appMenuRef = useRef(null);
  const medicineMenuRef = useRef(null);
  const purchaseMenuRef = useRef(null);
  const salesMenuRef = useRef(null);
  const repInvMenuRef = useRef(null);
  const accountMenuRef = useRef(null);
  const repAccMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts (F3, F6, F7, F8)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setProductListOpen((prev) => !prev);
      } else if (e.key === 'F6') {
        e.preventDefault();
        setCompanySetupOpen((prev) => !prev);
      } else if (e.key === 'F7') {
        e.preventDefault();
        setPurchaseEntryOpen((prev) => !prev);
      } else if (e.key === 'F8') {
        e.preventDefault();
        setPurchaseRegisterOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inCatalogue = catalogueMenuRef.current && catalogueMenuRef.current.contains(e.target);
      const inAppMenu = appMenuRef.current && appMenuRef.current.contains(e.target);
      const inMedicine = medicineMenuRef.current && medicineMenuRef.current.contains(e.target);
      const inPurchase = purchaseMenuRef.current && purchaseMenuRef.current.contains(e.target);
      const inSales = salesMenuRef.current && salesMenuRef.current.contains(e.target);
      const inRepInv = repInvMenuRef.current && repInvMenuRef.current.contains(e.target);
      const inAccount = accountMenuRef.current && accountMenuRef.current.contains(e.target);
      const inRepAcc = repAccMenuRef.current && repAccMenuRef.current.contains(e.target);
      if (!inCatalogue && !inAppMenu && !inMedicine && !inPurchase && !inSales && !inRepInv && !inAccount && !inRepAcc) {
        setActiveMenu(null);
        setPurchaseSubmenuOpen(false);
        setAccountVoucherSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format English Date
  const formattedEnDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Format Digital Clock (13:29:17 PM or HH:mm:ss AM/PM)
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Format Nepali BS Date
  const bsDate = getBikramSambatDate(currentTime);

  const hospitalTitle =
    currentBranch?.name?.toUpperCase() || 'SINDHUPALCHOWK DISTRICT HOSPITAL';

  const handleCatalogueSelect = (action) => {
    setActiveMenu(null);
    if (action === 'drug_setup') {
      setDrugSetupOpen(true);
    }
  };

  const handleCategorySelected = (catId) => {
    setDrugSetupOpen(false);
    if (catId === 'product_setup') {
      setProductListOpen(true);
    } else if (catId === 'company_setup') {
      setCompanySetupOpen(true);
    } else if (catId === 'generic_name_setup') {
      setGenericMedicineOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f2f5] select-none font-sans overflow-hidden">
      {/* 1. Top MediPro Application Menu Bar (Exact replica of Image 1 & Image 2) */}
      <div className="bg-[#ece9d8] border-b border-slate-400 text-xs shrink-0 z-30">
        {/* Upper title strip */}
        <div className="px-2 py-0.5 flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-red-700 tracking-wider">🏥 {hospitalTitle}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-normal">PHARMACY PURCHASE SALES SYSTEM</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono">
            <button
              onClick={onSwitchToModern}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded text-[10px] font-sans font-semibold shadow-xs"
              title="Switch to modern ERP view"
            >
              <Sparkles size={11} /> Modern ERP Dashboard
            </button>
            <span>mediking.org</span>
          </div>
        </div>

        {/* Menu Items Row */}
        <div className="flex items-center justify-between px-1 py-0.5 relative text-[11px]">
          <div className="flex items-center gap-0.5 flex-wrap">
            <div className="relative" ref={appMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'app' ? null : 'app')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'app' ? 'bg-[#316ac5] text-white' : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Menu
              </button>
              {activeMenu === 'app' && (
                <div className="absolute left-0 mt-0.5 w-48 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  <button
                    onClick={() => { setActiveMenu(null); onSwitchToLauncher?.(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Application Selection
                  </button>
                </div>
              )}
            </div>

            {/* Sales-Department Menu with Dropdown & Flyout Submenu (Image 5) */}
            <div className="relative" ref={salesMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'sales' ? null : 'sales')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'sales'
                    ? 'bg-[#316ac5] text-white'
                    : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Sales-Department
              </button>

              {activeMenu === 'sales' && (
                <div className="absolute left-0 mt-0.5 w-60 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setGoodsSalesSectionOpen(true);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white font-semibold text-blue-900"
                  >
                    Goods Sales Billing
                  </button>

                  <div className="flex cursor-not-allowed items-center justify-between px-3 py-1 text-slate-400">
                    <span>Issue Department</span><span className="text-[9px]">▶</span>
                  </div>

                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Sales Reverse Entry
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Print Invoice
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Print Credit Note
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    onClick={() => { setActiveMenu(null); setSalesReportOpen(true); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Sales / Sales-Return Register
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); setSalesReportOpen(true); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Sales Register
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Organization Member Report
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setUserwiseCashSummaryOpen(true);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white font-semibold text-blue-900"
                  >
                    Userwise Cash Summary
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Companywise Sales
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Productwise Sales
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Invoicewise Profit/Loss
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    IPD Requisition Book
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Cash To Teller
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Cash Hand Over
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Army Report
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    IPD Requisition Print
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Requisition Form
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Cash From Cashier
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Cash From Teller
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Teller Report
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Cash Collection Report
                  </button>
                </div>
              )}
            </div>

            {/* Purchase-Department Menu with Dropdown & Flyout Submenu (Image 2) */}
            <div className="relative" ref={purchaseMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'purchase' ? null : 'purchase')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'purchase'
                    ? 'bg-[#316ac5] text-white'
                    : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Purchase-Department
              </button>

              {activeMenu === 'purchase' && (
                <div className="absolute left-0 mt-0.5 w-60 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Requisition Form
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Purchase Order Approved
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Purchase Order Approved Edit
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  {/* Purchase Section with nested flyout submenu (Image 2) */}
                  <div
                    className="relative group/sub"
                    onMouseEnter={() => setPurchaseSubmenuOpen(true)}
                    onMouseLeave={() => setPurchaseSubmenuOpen(false)}
                  >
                    <div className="w-full px-3 py-1 bg-blue-50 text-[#0a246a] hover:bg-[#316ac5] hover:text-white flex items-center justify-between cursor-pointer font-semibold">
                      <span>Purchase Section</span>
                      <span className="text-[9px]">▶</span>
                    </div>

                    {purchaseSubmenuOpen && (
                      <div className="absolute left-full top-0 w-52 bg-white border border-slate-400 shadow-2xl py-0.5 z-60 text-slate-900 text-[11px] font-sans">
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            setPurchaseSubmenuOpen(false);
                            setPurchaseEntryOpen(true);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#316ac5] hover:text-white font-bold flex items-center justify-between text-blue-900"
                        >
                          <span>Purchase Entry</span>
                          <span className="text-[9px] text-slate-400 font-mono">F7</span>
                        </button>
                        <button
                          disabled
                          className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                        >
                          Purchase Return
                        </button>
                        <button
                          disabled
                          className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                        >
                          Purchase Return Shettled
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex cursor-not-allowed items-center justify-between px-3 py-1 text-slate-400">
                    <span>Stock Adjustment Section</span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Modify Purchase
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Purchase Return Cancel
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Purchase Expiry Return Shettle Cancel
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Stock Adjustment Cancel
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Print MRN
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Purchase Return Slip
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Stock Adjustment Slip
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  {/* Purchase / Adjustment Register (Image 4) */}
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setPurchaseRegisterOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#316ac5] hover:text-white font-bold text-blue-900 flex items-center justify-between"
                  >
                    <span>Purchase / Adjustment Register</span>
                    <span className="text-[9px] text-slate-400 font-mono">F8</span>
                  </button>

                  {/* Direct Purchase Book shortcut (Image 5) */}
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setPurchaseBookOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#316ac5] hover:text-white font-bold text-blue-900 flex items-center justify-between border-t border-slate-200"
                  >
                    <span>Purchase Book</span>
                    <span className="text-[9px] text-slate-400 font-mono">Image 5</span>
                  </button>
                </div>
              )}
            </div>

            <button disabled className="cursor-not-allowed px-2 py-0.5 text-slate-400">
              In-Patient Section
            </button>
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => {
                  setActiveMenu(activeMenu === 'account' ? null : 'account');
                  setAccountVoucherSubmenuOpen(false);
                }}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'account' ? 'bg-[#316ac5] text-white' : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Account-Department
              </button>
              {activeMenu === 'account' && (
                <div className="absolute left-0 mt-0.5 w-56 border border-slate-400 bg-white py-0.5 text-[11px] text-slate-900 shadow-xl">
                  <div
                    className="relative"
                    onMouseEnter={() => setAccountVoucherSubmenuOpen(true)}
                    onMouseLeave={() => setAccountVoucherSubmenuOpen(false)}
                  >
                    <button
                      onClick={() => setAccountVoucherSubmenuOpen((open) => !open)}
                      className="flex w-full items-center justify-between bg-[#316ac5] px-3 py-1 text-left font-semibold text-white"
                    >
                      <span>Voucher Entry Section</span><span>›</span>
                    </button>
                    {accountVoucherSubmenuOpen && (
                      <div className="absolute left-full top-0 z-[55] w-64 border border-slate-400 bg-white py-0.5 text-slate-900 shadow-xl">
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            setAccountVoucherSubmenuOpen(false);
                            setJournalVoucherOpen(true);
                          }}
                          className="w-full px-3 py-1.5 text-left font-semibold text-blue-900 hover:bg-[#316ac5] hover:text-white"
                        >
                          Journal Voucher Entry
                        </button>
                        {['Expense/Purchase Voucher Entry', 'TDS Voucher Entry', 'Payment Voucher', 'Receipt Voucher'].map((label) => (
                          <button key={label} disabled className="w-full cursor-not-allowed px-3 py-1.5 text-left text-slate-400">
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button disabled className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400">Voucher Report Section</button>
                </div>
              )}
            </div>
            {/* Reports-Inventory Menu with Dropdown (Image 2) */}
            <div className="relative" ref={repInvMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'rep_inv' ? null : 'rep_inv')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'rep_inv'
                    ? 'bg-[#316ac5] text-white'
                    : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Reports-Inventory
              </button>

              {activeMenu === 'rep_inv' && (
                <div className="absolute left-0 mt-0.5 w-52 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Stock/Sales Summary
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Stock Register
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Partywise Stock Register
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setStockBalanceOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#316ac5] hover:text-white font-bold text-blue-900 flex items-center justify-between"
                  >
                    <span>Stock Balance</span>
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Stock Analysis
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Stock MIS
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Maximum Sales
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Expiry Stock Register
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Expiry Stock Balance
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={repAccMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'rep_acc' ? null : 'rep_acc')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'rep_acc' ? 'bg-[#316ac5] text-white' : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Reports-Account
              </button>
              {activeMenu === 'rep_acc' && (
                <div className="absolute left-0 mt-0.5 w-52 border border-slate-400 bg-white py-0.5 text-[11px] text-slate-900 shadow-xl">
                  {['Quick Balance', 'Statement', 'Supplier Section', 'Trial Balance', 'Final Account', 'Aging', 'Aging All', 'Final Report'].map((label) => (
                    label === 'Statement' ? (
                      <button
                        key={label}
                        onClick={() => {
                          setActiveMenu(null);
                          setStatementOpen(true);
                        }}
                        className="w-full px-3 py-1.5 text-left font-semibold text-blue-900 hover:bg-[#316ac5] hover:text-white"
                      >
                        {label}
                      </button>
                    ) : (
                      <button key={label} disabled className="w-full cursor-not-allowed px-3 py-1.5 text-left text-slate-400">{label}</button>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Catalogue Menu with Dropdown (Image 2) */}
            <div className="relative" ref={catalogueMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'catalogue' ? null : 'catalogue')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'catalogue'
                    ? 'bg-[#316ac5] text-white'
                    : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Catalogue
              </button>

              {activeMenu === 'catalogue' && (
                <div className="absolute left-0 mt-0.5 w-56 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  <button
                    onClick={() => handleCatalogueSelect('drug_setup')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between"
                  >
                    <span>Drug Setup</span>
                    <span className="text-[9px] text-slate-400 group-hover:text-white font-mono">F3</span>
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Cash Party
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    ICD Code Setup
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Organization Member Master
                  </button>
                  <div className="border-t border-slate-200 my-0.5"></div>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Place Order
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Fill Tender
                  </button>
                  <button
                    disabled
                    className="w-full cursor-not-allowed px-3 py-1 text-left text-slate-400"
                  >
                    Re-Order
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={medicineMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'medicine' ? null : 'medicine')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'medicine'
                    ? 'bg-[#316ac5] text-white'
                    : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Medicine
              </button>
              {activeMenu === 'medicine' && (
                <div className="absolute left-0 mt-0.5 w-44 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setGenericMedicineOpen(true);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Generic Medicine
                  </button>
                </div>
              )}
            </div>

            <button disabled className="cursor-not-allowed px-2 py-0.5 text-slate-400">
              Maintenance and Utility
            </button>
            <button
              onClick={() => {
                setActiveMenu(null);
                onSwitchToLauncher?.();
              }}
              className="px-2 py-0.5 hover:bg-rose-600 hover:text-white rounded-xs transition text-rose-700 font-semibold"
            >
              Exit
            </button>
          </div>

          <div className="font-bold text-[#0a246a] uppercase pr-2 text-[10px]">
            ADMINISTRATOR
          </div>
        </div>
      </div>

      {/* 2. Central Stage (Exact representation of Image 1) */}
      <div className="flex-1 relative bg-white flex flex-col justify-between overflow-hidden">
        {/* Curved Deep Navy Blue Header Banner */}
        <div className="relative w-full h-32 sm:h-40 bg-[#2b4c7e] overflow-hidden shadow-md">
          {/* Header Title Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest text-white font-extrabold text-center drop-shadow-md px-4">
              {hospitalTitle}
            </h1>
          </div>

          {/* Elegant diagonal curve graphic matching Image 1 */}
          <svg
            className="absolute bottom-0 left-0 w-full h-24 text-white pointer-events-none"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 L1440,120 L1440,0 C1000,100 400,20 0,120 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Central Watermark & MediKing Logo Area */}
        <div className="flex-1 px-8 py-6 flex flex-col md:flex-row items-center justify-between relative">
          {/* Left: Department Watermark text or Goods Sales Billing section (Image 1) */}
          <div className="mb-8 md:mb-0">
            {goodsSalesSectionOpen ? (
              /* Exact reproduction of Image 1 */
              <div className="space-y-4 font-mono select-none">
                <div className="flex items-center gap-4 text-xs font-sans text-slate-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forInsurance}
                      onChange={(e) => setForInsurance(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span className="font-semibold">For Insurance</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forSSF}
                      onChange={(e) => setForSSF(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span className="font-semibold">SSF</span>
                  </label>
                </div>

                <div className="flex flex-col space-y-2 pt-1 text-[#0066cc] text-sm font-mono tracking-wide">
                  <button
                    type="button"
                    onClick={() => {
                      setCashSalesReturn(false);
                      setCashSalesOpen(true);
                    }}
                    className="text-left hover:underline cursor-pointer font-bold"
                  >
                    Sales Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCashSalesReturn(false);
                      setCashSalesOpen(true);
                    }}
                    className="text-left hover:underline cursor-pointer font-bold"
                  >
                    Sales Billing (Batch)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCashSalesReturn(false);
                      setCashSalesOpen(true);
                    }}
                    className="text-left hover:underline cursor-pointer font-bold"
                  >
                    Sales Billing Open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCashSalesReturn(true);
                      setCashSalesOpen(true);
                    }}
                    className="text-left hover:underline cursor-pointer font-bold text-rose-700"
                  >
                    Sales Return
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setGoodsSalesSectionOpen(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-700 underline font-sans"
                  >
                    ← Back to Department Home
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-mono text-lg sm:text-xl text-[#2b4c7e] font-semibold tracking-wider select-none">
                  Pharmacy Department
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Terminal: POS-01 • Branch: {currentBranch?.code || 'MK-KTM'}
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setGoodsSalesSectionOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#e6f0ff] to-[#c8ddff] hover:from-white hover:to-[#b6d2ff] border border-blue-500 rounded-xs text-xs font-bold text-blue-900 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Goods Sales Billing (Image 1)"
                  >
                    <span>💳</span>
                    <span>Goods Sales Billing</span>
                  </button>
                  <button
                    onClick={() => setProductListOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#f9f9f9] to-[#e4e4e4] hover:from-white hover:to-[#d8d8d8] border border-slate-400 rounded-xs text-xs font-bold text-slate-800 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Master Drug Catalog (F3)"
                  >
                    <Pill size={14} className="text-teal-600" />
                    <span>Drug Catalogue (F3)</span>
                  </button>
                  <button
                    onClick={() => handleCatalogueSelect('drug_setup')}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#f9f9f9] to-[#e4e4e4] hover:from-white hover:to-[#d8d8d8] border border-slate-400 rounded-xs text-xs font-bold text-slate-800 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Drug Setup Categories"
                  >
                    <Boxes size={14} className="text-blue-600" />
                    <span>Drug Setup Category</span>
                  </button>
                  <button
                    onClick={() => setCompanySetupOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#f9f9f9] to-[#e4e4e4] hover:from-white hover:to-[#d8d8d8] border border-slate-400 rounded-xs text-xs font-bold text-slate-800 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Company Master (Image 1 / F6)"
                  >
                    <span>🏢</span>
                    <span>Company Setup (F6)</span>
                  </button>
                  <button
                    onClick={() => setPurchaseEntryOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#fff3f3] to-[#ffdada] hover:from-white hover:to-[#ffc8c8] border border-rose-400 rounded-xs text-xs font-bold text-rose-900 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Purchase Entry (Image 3 / F7)"
                  >
                    <ShoppingCart size={14} className="text-rose-700" />
                    <span>Purchase Entry (F7)</span>
                  </button>
                  <button
                    onClick={() => setPurchaseRegisterOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#f9f9f9] to-[#e4e4e4] hover:from-white hover:to-[#d8d8d8] border border-slate-400 rounded-xs text-xs font-bold text-slate-800 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Purchase Register (Image 4 / F8)"
                  >
                    <Receipt size={14} className="text-indigo-600" />
                    <span>Purchase Register (F8)</span>
                  </button>
                  <button
                    onClick={() => setPurchaseBookOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-b from-[#f0f4ff] to-[#d9e2ec] hover:from-white hover:to-[#bcccdc] border border-blue-400 rounded-xs text-xs font-bold text-blue-950 shadow-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Open Purchase Book directly (Image 5)"
                  >
                    <span>📖</span>
                    <span>Purchase Book</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: The iconic MediPro / MediKing Emblem (Image 1) */}
          <div className="flex flex-col items-center md:items-end text-right select-none">
            <div className="flex items-center gap-3">
              {/* Three-wave iconic emblem */}
              <div className="relative w-28 h-20 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/80 border-t-transparent -rotate-45"></div>
                </div>
                <div className="flex items-baseline font-black text-3xl tracking-tighter text-[#1b6ca8]">
                  <span className="text-4xl italic text-[#0f4c81]">M</span>
                  <div className="flex flex-col leading-none ml-0.5">
                    <span className="text-[#0f4c81] text-xl font-black">MEDI</span>
                    <span className="text-[#1b6ca8] text-2xl font-black -mt-1">KING</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-red-600 uppercase mt-1">
              PIONEER IN HEALTHCARE INNOVATION
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
              Powered by MediKing Health Systems
            </div>
          </div>
        </div>

        {/* 3. Bottom Status Bar (Exact replica of Image 1) */}
        <div className="h-8 bg-[#2b4c7e] text-white px-4 flex items-center justify-between text-xs font-sans font-semibold tracking-wide shrink-0 border-t border-slate-400">
          {/* Left: English Date */}
          <div className="w-1/3 truncate text-left">{formattedEnDate}</div>

          {/* Center: Live Digital Clock */}
          <div className="w-1/3 text-center font-mono font-bold text-sm tracking-wider text-yellow-300">
            {formattedTime}
          </div>

          {/* Right: Nepali Bikram Sambat Date */}
          <div className="w-1/3 text-right uppercase tracking-wider font-medium text-emerald-200">
            {bsDate.formatted}
          </div>
        </div>
      </div>

      {/* Drug Setup Modal (Image 3) */}
      <DrugSetupModal
        isOpen={drugSetupOpen}
        onClose={() => setDrugSetupOpen(false)}
        onSelectCategory={handleCategorySelected}
      />

      {/* Product Setup / Product List Modal (Image 4 & Image 5) */}
      <ProductListModal
        isOpen={productListOpen}
        onClose={() => setProductListOpen(false)}
      />

      {/* 1. Company Setup Modal (Image 1) */}
      <CompanySetupModal
        isOpen={companySetupOpen}
        onClose={() => setCompanySetupOpen(false)}
        onSelectCompany={(c) => {
          alert(`Selected Company: [${c.compCode}] ${c.companyName}`);
        }}
      />

      {/* 2. Purchase Entry Modal (Image 3) */}
      <PurchaseEntryModal
        isOpen={purchaseEntryOpen}
        onClose={() => setPurchaseEntryOpen(false)}
        onPurchaseCreated={() => {
          setPurchaseBookOpen(true);
        }}
      />

      {/* 3. Purchase / Adjustment Register Modal (Image 4) */}
      <PurchaseRegisterModal
        isOpen={purchaseRegisterOpen}
        onClose={() => setPurchaseRegisterOpen(false)}
        onOpenPurchaseBook={(range) => {
          setPurchaseBookDateRange(range);
          setPurchaseBookOpen(true);
        }}
      />

      {/* 4. Purchase Book Modal (Image 5) */}
      <PurchaseBookModal
        isOpen={purchaseBookOpen}
        onClose={() => setPurchaseBookOpen(false)}
        initialDateRange={purchaseBookDateRange}
      />

      {/* Stock Balance Function Dialog (Image 3) */}
      <StockBalanceModal
        isOpen={stockBalanceOpen}
        onClose={() => setStockBalanceOpen(false)}
        onOpenReport={() => {
          setStockBalanceOpen(false);
          setStockValuationOpen(true);
        }}
      />

      {/* Stock Balance At / Valuation Report Window (Image 4) */}
      <StockBalanceValuationModal
        isOpen={stockValuationOpen}
        onClose={() => setStockValuationOpen(false)}
        initialDate={bsDate.formatted || '2078/05/14'}
      />

      {/* Cash Sales & Sales Return Modal (Image 2 & 3) */}
      <CashSalesModal
        isOpen={cashSalesOpen}
        onClose={() => setCashSalesOpen(false)}
        isReturn={cashSalesReturn}
        initialDateBs={bsDate.formatted || '2078/05/14'}
      />

      {/* Userwise Cash Summary Modal (Image 4) */}
      <UserwiseCashSummaryModal
        isOpen={userwiseCashSummaryOpen}
        onClose={() => setUserwiseCashSummaryOpen(false)}
        initialFromDate="2078/05/01"
        initialToDate={bsDate.formatted || '2078/05/14'}
      />

      <SalesReportModal
        isOpen={salesReportOpen}
        onClose={() => setSalesReportOpen(false)}
      />

      <GenericMedicineModal
        isOpen={genericMedicineOpen}
        onClose={() => setGenericMedicineOpen(false)}
      />

      <JournalVoucherModal
        isOpen={journalVoucherOpen}
        onClose={() => setJournalVoucherOpen(false)}
      />

      <StatementModal
        isOpen={statementOpen}
        onClose={() => setStatementOpen(false)}
      />
    </div>
  );
}
