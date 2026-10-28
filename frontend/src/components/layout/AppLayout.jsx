import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NewPatientModal from '../modals/NewPatientModal';
import ProductListModal from '../medipro/ProductListModal';
import DrugSetupModal from '../medipro/DrugSetupModal';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [productListOpen, setProductListOpen] = useState(false);
  const [drugSetupOpen, setDrugSetupOpen] = useState(false);

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('mediking_view_mode') || 'launcher';
  });

  useEffect(() => {
    const handleModeChange = (e) => {
      setViewMode(e.detail || localStorage.getItem('mediking_view_mode') || 'medipro');
    };
    window.addEventListener('view-mode-changed', handleModeChange);
    return () => window.removeEventListener('view-mode-changed', handleModeChange);
  }, []);

  const handleSelectDrugSetupCategory = (catId) => {
    setDrugSetupOpen(false);
    if (catId === 'product_setup') {
      setProductListOpen(true);
    } else {
      alert(`Opening ${catId.replace(/_/g, ' ').toUpperCase()}...`);
    }
  };

  // Full screen MediPro Desktop UI without letterbox empty space
  if (viewMode === 'medipro' || viewMode === 'attendance' || viewMode === 'launcher' || viewMode === 'account') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#ece9d8]">
        <Outlet
          context={{
            onOpenNewPatient: () => setPatientModalOpen(true),
            onOpenProductList: () => setProductListOpen(true),
            onOpenDrugSetup: () => setDrugSetupOpen(true),
          }}
        />

        <NewPatientModal
          isOpen={patientModalOpen}
          onClose={() => setPatientModalOpen(false)}
          onPatientCreated={() => {
            window.dispatchEvent(new CustomEvent('patient-created'));
          }}
        />

        <ProductListModal
          isOpen={productListOpen}
          onClose={() => setProductListOpen(false)}
        />

        <DrugSetupModal
          isOpen={drugSetupOpen}
          onClose={() => setDrugSetupOpen(false)}
          onSelectCategory={handleSelectDrugSetupCategory}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenNewPatient={() => setPatientModalOpen(true)}
          onOpenProductList={() => setProductListOpen(true)}
          onOpenDrugSetup={() => setDrugSetupOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              onOpenNewPatient: () => setPatientModalOpen(true),
              onOpenProductList: () => setProductListOpen(true),
              onOpenDrugSetup: () => setDrugSetupOpen(true),
            }}
          />
        </main>
      </div>

      {/* Global Modals */}
      <NewPatientModal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onPatientCreated={() => {
          window.dispatchEvent(new CustomEvent('patient-created'));
        }}
      />

      <ProductListModal
        isOpen={productListOpen}
        onClose={() => setProductListOpen(false)}
      />

      <DrugSetupModal
        isOpen={drugSetupOpen}
        onClose={() => setDrugSetupOpen(false)}
        onSelectCategory={handleSelectDrugSetupCategory}
      />
    </div>
  );
}
