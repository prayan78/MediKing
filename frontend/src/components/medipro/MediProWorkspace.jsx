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
import {
  Pill,
  ShoppingCart,
  Boxes,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MediProWorkspace({ onSwitchToModern }) {
  const { user, currentBranch, logout } = useAuth();
  const navigate = useNavigate();

  // Menu dropdown states
  const [activeMenu, setActiveMenu] = useState(null); // 'catalogue', 'purchase', 'sales', 'rep_inv', 'rep_acc', etc.
  const [purchaseSubmenuOpen, setPurchaseSubmenuOpen] = useState(false);
  const [salesSubmenuOpen, setSalesSubmenuOpen] = useState(false);
  const [accSubmenuOpen, setAccSubmenuOpen] = useState(false);

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

  // Live Clock & Dates
  const [currentTime, setCurrentTime] = useState(new Date());

  const catalogueMenuRef = useRef(null);
  const purchaseMenuRef = useRef(null);
  const salesMenuRef = useRef(null);
  const repInvMenuRef = useRef(null);
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
      const inPurchase = purchaseMenuRef.current && purchaseMenuRef.current.contains(e.target);
      const inSales = salesMenuRef.current && salesMenuRef.current.contains(e.target);
      const inRepInv = repInvMenuRef.current && repInvMenuRef.current.contains(e.target);
      const inRepAcc = repAccMenuRef.current && repAccMenuRef.current.contains(e.target);
      if (!inCatalogue && !inPurchase && !inSales && !inRepInv && !inRepAcc) {
        setActiveMenu(null);
        setPurchaseSubmenuOpen(false);
        setSalesSubmenuOpen(false);
        setAccSubmenuOpen(false);
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
    } else if (action === 'cash_party') {
      alert('Cash Party & Ledger Setup');
    } else if (action === 'icd_code_setup') {
      alert('ICD-10 Diagnostic Codes Setup');
    } else if (action === 'org_member_master') {
      alert('Organization Member Master');
    } else {
      alert(`Selected: ${action.replace('_', ' ').toUpperCase()}`);
    }
  };

  const handleCategorySelected = (catId) => {
    setDrugSetupOpen(false);
    if (catId === 'product_setup') {
      setProductListOpen(true);
    } else if (catId === 'company_setup') {
      setCompanySetupOpen(true);
    } else {
      alert(`Opening ${catId.replace(/_/g, ' ').toUpperCase()}...`);
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

                  {/* Issue Department with nested flyout submenu */}
                  <div
                    className="relative group/sub"
                    onMouseEnter={() => setSalesSubmenuOpen(true)}
                    onMouseLeave={() => setSalesSubmenuOpen(false)}
                  >
                    <div className="w-full px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between cursor-pointer">
                      <span>Issue Department</span>
                      <span className="text-[9px]">▶</span>
                    </div>

                    {salesSubmenuOpen && (
                      <div className="absolute left-full top-0 w-52 bg-white border border-slate-400 shadow-2xl py-0.5 z-60 text-slate-900 text-[11px] font-sans">
                        <button
                          onClick={() => { setActiveMenu(null); setSalesSubmenuOpen(false); alert('Department Issue Entry'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Department Issue Entry
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); setSalesSubmenuOpen(false); alert('Department Issue Return'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Department Issue Return
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); setSalesSubmenuOpen(false); alert('Department Issue Register'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Department Issue Register
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setActiveMenu(null); alert('Sales Reverse Entry'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Sales Reverse Entry
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Print Invoice'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Print Invoice
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Print Credit Note'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
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
                    onClick={() => { setActiveMenu(null); alert('Organization Member Report'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
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
                    onClick={() => { setActiveMenu(null); alert('Companywise Sales'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Companywise Sales
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Productwise Sales'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Productwise Sales
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Invoicewise Profit/Loss'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Invoicewise Profit/Loss
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    onClick={() => { setActiveMenu(null); alert('IPD Requisition Book'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    IPD Requisition Book
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Cash To Teller'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Cash To Teller
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Cash Hand Over'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Cash Hand Over
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Army Report'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Army Report
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('IPD Requisition Print'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    IPD Requisition Print
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Requisition Form'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Requisition Form
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    onClick={() => { setActiveMenu(null); alert('Cash From Cashier'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Cash From Cashier
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Cash From Teller'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Cash From Teller
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Teller Report'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Teller Report
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Cash Collection Report'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
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
                    onClick={() => { setActiveMenu(null); alert('Requisition Form'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Requisition Form
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Purchase Order Approved'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Purchase Order Approved
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Purchase Order Approved Edit'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
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
                          onClick={() => {
                            setActiveMenu(null);
                            setPurchaseSubmenuOpen(false);
                            alert('Purchase Return');
                          }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Purchase Return
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            setPurchaseSubmenuOpen(false);
                            alert('Purchase Return Shettled');
                          }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Purchase Return Shettled
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-1 text-slate-400 flex items-center justify-between cursor-default">
                    <span>Stock Adjustment Section</span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    onClick={() => { setActiveMenu(null); alert('Modify Purchase'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Modify Purchase
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Purchase Return Cancel'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Purchase Return Cancel
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Purchase Expiry Return Shettle Cancel'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Purchase Expiry Return Shettle Cancel
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Stock Adjustment Cancel'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Stock Adjustment Cancel
                  </button>

                  <div className="border-t border-slate-200 my-0.5"></div>

                  <button
                    onClick={() => { setActiveMenu(null); alert('Print MRN'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Print MRN
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Purchase Return Slip'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Purchase Return Slip
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Stock Adjustment Slip'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
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

            <button
              onClick={() => setActiveMenu(activeMenu === 'inpatient' ? null : 'inpatient')}
              className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-xs transition text-slate-900"
            >
              In-Patient Section
            </button>
            <button
              onClick={() => setActiveMenu(activeMenu === 'account' ? null : 'account')}
              className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-xs transition text-slate-900"
            >
              Account-Department
            </button>
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
                    onClick={() => { setActiveMenu(null); alert('Stock/Sales Summary'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Stock/Sales Summary
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Stock Register'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Stock Register
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Partywise Stock Register'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
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
                    onClick={() => { setActiveMenu(null); alert('Stock Analysis'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Stock Analysis
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Stock MIS'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Stock MIS
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Maximum Sales'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Maximum Sales
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Expiry Stock Register'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Expiry Stock Register
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); alert('Expiry Stock Balance'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Expiry Stock Balance
                  </button>
                </div>
              )}
            </div>

            {/* Reports-Account Menu with Dropdown & Flyout Submenu (Image 1) */}
            <div className="relative" ref={repAccMenuRef}>
              <button
                onClick={() => setActiveMenu(activeMenu === 'rep_acc' ? null : 'rep_acc')}
                className={`px-2 py-0.5 rounded-xs transition font-semibold ${
                  activeMenu === 'rep_acc'
                    ? 'bg-[#316ac5] text-white'
                    : 'hover:bg-[#316ac5] hover:text-white text-slate-900'
                }`}
              >
                Reports-Account
              </button>

              {activeMenu === 'rep_acc' && (
                <div className="absolute left-0 mt-0.5 w-48 bg-white border border-slate-400 shadow-xl py-0.5 z-50 text-slate-900 text-[11px] font-sans">
                  {/* General Ledger with flyout submenu */}
                  <div
                    className="relative group/sub"
                    onMouseEnter={() => setAccSubmenuOpen(true)}
                    onMouseLeave={() => setAccSubmenuOpen(false)}
                  >
                    <div
                      onClick={() => {
                        setActiveMenu(null);
                        setAccSubmenuOpen(false);
                        alert('General Ledger');
                      }}
                      className="w-full px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>General Ledger</span>
                      <span className="text-[9px]">▶</span>
                    </div>

                    {accSubmenuOpen && (
                      <div className="absolute left-full top-0 w-48 bg-white border border-slate-400 shadow-2xl py-0.5 z-60 text-slate-900 text-[11px] font-sans">
                        <button
                          onClick={() => { setActiveMenu(null); setAccSubmenuOpen(false); alert('General Ledger'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          General Ledger
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); setAccSubmenuOpen(false); alert('Party Ledger'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Party Ledger
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); setAccSubmenuOpen(false); alert('Cash / Bank Book'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Cash / Bank Book
                        </button>
                        <button
                          onClick={() => { setActiveMenu(null); setAccSubmenuOpen(false); alert('Daily Transaction Report'); }}
                          className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                        >
                          Daily Transaction Report
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setActiveMenu(null); alert('Debtor Section'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Debtor Section
                  </button>
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
                    onClick={() => handleCatalogueSelect('cash_party')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Cash Party
                  </button>
                  <button
                    onClick={() => handleCatalogueSelect('icd_code_setup')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    ICD Code Setup
                  </button>
                  <button
                    onClick={() => handleCatalogueSelect('org_member_master')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Organization Member Master
                  </button>
                  <div className="border-t border-slate-200 my-0.5"></div>
                  <button
                    onClick={() => handleCatalogueSelect('place_order')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Place Order
                  </button>
                  <button
                    onClick={() => handleCatalogueSelect('fill_tender')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Fill Tender
                  </button>
                  <button
                    onClick={() => handleCatalogueSelect('re_order')}
                    className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
                  >
                    Re-Order
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveMenu(activeMenu === 'maint' ? null : 'maint')}
              className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-xs transition text-slate-900"
            >
              Maintenance and Utility
            </button>
            <button
              onClick={() => {
                if (window.confirm('Do you want to log out of MediKing?')) {
                  logout();
                  navigate('/login');
                }
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
    </div>
  );
}
