# MediKing — Hospital, Clinic, Laboratory & Pharmacy ERP Web Application

**MediKing** is a modern medical and pharmacy management web platform inspired by the workflows of **MediPro**. It brings the high-efficiency, batch-aware, keyboard-friendly capabilities of medical ERPs to the web with an intuitive, clean interface.

---

## 🚀 Key Highlights & Architectural Features

- **Multi-Branch Support**: Switch effortlessly between hospital branches (e.g. Kathmandu Central vs Lalitpur Polyclinic).
- **Role-Based Access Control (RBAC)**: Enforced server-side across 10 institutional roles:
  - Super Administrator, Hospital Administrator, Doctor, Nurse, Receptionist, Pharmacist, Lab Technician, Lab Verifier, Accountant, Inventory Manager.
- **Expiry-First & Batch-Aware Pharmacy**:
  - Live stock tracking per batch number, purchase price, MRP, and expiry date.
  - Automatic near-expiry (<90 days) and low-stock reorder alerts.
  - IRD/PAN/VAT tax-compliant printable cash invoices.
- **OPD & Queue Token System**:
  - Live patient waiting, in-consultation, and completed queue tracking.
  - Vital signs recording (BP, Pulse, Temperature, SpO2) and digital prescriptions.
- **Diagnostic Laboratory Catalog**:
  - Multi-parameter reference ranges (Male, Female, Child) and two-step verification.
- **Live Database-Driven Dashboard**:
  - Today's patient registrations, OPD visits, pharmacy sales, lab workload, and customer credit ledger (Udharo).

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS v4, Lucide Icons, Axios, React Router.
- **Backend**: Node.js, Express, Mongoose, JWT authentication, bcryptjs, express-rate-limit.
- **Database**: MongoDB (Local or Atlas).
- **Testing**: Jest + Supertest (automated API test suite).

---

## 📋 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI.

### 2. Install Dependencies
```bash
# Install root and backend/frontend dependencies
npm run install:all
```

### 3. Seed the Database
Populate branches, departments, doctors, test medicines with batches, lab catalogs, and sample transactions:
```bash
npm run seed
```

### 4. Run the Development Servers
In two separate terminals:

**Backend Server (Port 5000):**
```bash
npm run backend
```

**Frontend App (Port 5173):**
```bash
npm run frontend
```

Open your browser at `http://localhost:5173`.

---

## 🔑 Default Institutional Logins

Use the one-click demo credentials picker on the login page or enter:

| Role | Email / Username | Password |
|---|---|---|
| **Super Admin** | `admin@mediking.com` | `admin123` |
| **Pharmacist** | `pharmacist@mediking.com` | `pharma123` |
| **Doctor** | `doctor@mediking.com` | `doctor123` |
| **OPD Reception** | `reception@mediking.com` | `recep123` |
| **Laboratory** | `lab@mediking.com` | `lab123` |
| **Accountant** | `accountant@mediking.com` | `acc123` |

---

## 🧪 Automated Testing
Run the backend test suite:
```bash
npm run test:backend
```
All tests verify health check, JWT authentication, role guards, dashboard aggregations, patient registration, and duplicate detection.

