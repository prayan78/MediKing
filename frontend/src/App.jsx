import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminManagement from './pages/AdminManagement';
import SystemSettings from './pages/SystemSettings';
import ModulePlaceholder from './pages/ModulePlaceholder';
import {
  Users,
  Stethoscope,
  BedDouble,
  FlaskConical,
  Receipt,
  Boxes,
  BarChart3,
} from 'lucide-react';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying institutional session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route
              path="patients"
              element={
                <ModulePlaceholder
                  title="Patient Registration & Medical Records (MRN)"
                  description="Central patient indexing, demographic records, allergies, duplicate warnings, and printable registration slip."
                  icon={Users}
                  phase="Phase 2 Feature"
                  highlights={[
                    'Automatic MRN generation (e.g. MK-2026-00001) with barcode format.',
                    'Duplicate patient warnings checking name and phone number matches.',
                    'Patient comprehensive profile with visit history, prescriptions, lab results, and outstanding credit.',
                  ]}
                />
              }
            />

            <Route
              path="opd"
              element={
                <ModulePlaceholder
                  title="OPD Queue, Appointments & Doctor Consultations"
                  description="Token issuance, doctor schedules, consultation notes, symptoms, vitals tracking, and digital Rx prescription."
                  icon={Stethoscope}
                  phase="Phase 2 Feature"
                  highlights={[
                    'Queue token generation by department and doctor availability.',
                    'Doctor consultation workspace with vitals, complaints, diagnoses, and digital prescriptions.',
                    'Consultation fee billing integration and follow-up tracking.',
                  ]}
                />
              }
            />

            <Route
              path="ipd"
              element={
                <ModulePlaceholder
                  title="IPD Inpatient Admissions & Ward Bed Management"
                  description="Ward, room and bed tracking, admission orders, nursing MAR chart, doctor rounds, and discharge summaries."
                  icon={BedDouble}
                  phase="Phase 5 Feature"
                  highlights={[
                    'Interactive graphical bed matrix with occupancy indicators (Vacant, Occupied, Cleaning).',
                    'Medication Administration Record (MAR) and daily doctor progress notes.',
                    'Itemized bed charges and final unified discharge invoice generation.',
                  ]}
                />
              }
            />

            <Route
              path="pharmacy"
              element={<Dashboard />}
            />

            <Route
              path="laboratory"
              element={
                <ModulePlaceholder
                  title="Pathology & Diagnostic Laboratory Management"
                  description="Test catalog, sample collection with accession numbers, multi-parameter result entry, and pathologist sign-off."
                  icon={FlaskConical}
                  phase="Phase 4 Feature"
                  highlights={[
                    'Configurable test parameters with age- and gender-specific reference ranges.',
                    'Two-step verification: Technician data entry followed by authorized Pathologist verification.',
                    'Printable formal lab report with hospital header, QR verification, and sign-offs.',
                  ]}
                />
              }
            />

            <Route
              path="billing"
              element={
                <ModulePlaceholder
                  title="Billing, Cashier & IRD Compliant Invoicing"
                  description="Unified hospital invoices, cashier daily closing, partial payments, credit ledger, and VAT/PAN reports."
                  icon={Receipt}
                  phase="Phase 5 Feature"
                  highlights={[
                    'IRD-ready invoice sequences with PAN/VAT tax computations.',
                    'Customer credit ledger with outstanding balance payment reconciliations.',
                    'Daily cashier cashbook closing and payment method breakdowns (Cash, QR, Card).',
                  ]}
                />
              }
            />

            <Route
              path="inventory"
              element={
                <ModulePlaceholder
                  title="Procurement & Stock Inventory Management"
                  description="Supplier management, purchase orders, goods receipt notes (GRN), batch registration, and stock transfers."
                  icon={Boxes}
                  phase="Phase 3 Feature"
                  highlights={[
                    'Supplier Purchase Orders (PO) with goods receipt invoice verification.',
                    'Batch number, manufacturing/expiry date, purchase rate, and MRP tracking.',
                    'Automatic reorder alerts when medicines reach safety stock thresholds.',
                  ]}
                />
              }
            />

            <Route
              path="admin"
              element={<AdminManagement />}
            />

            <Route
              path="reports"
              element={
                <ModulePlaceholder
                  title="Reports, Financial Audits & Analytics"
                  description="Comprehensive reporting on OPD patient footfall, pharmacy profits, doctor performance, and tax ledgers."
                  icon={BarChart3}
                  phase="Phase 6 Feature"
                  highlights={[
                    'Daily, weekly, and monthly revenue and collections breakdown.',
                    'Pharmacy expiry loss and profit margin analysis.',
                    'Export to CSV/Excel and print-ready PDF formats.',
                  ]}
                />
              }
            />

            <Route
              path="settings"
              element={<SystemSettings />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
