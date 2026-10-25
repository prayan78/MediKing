import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  UserCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please provide credentials');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(usernameOrEmail, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  const setDemoCredentials = (email, pass) => {
    setUsernameOrEmail(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-teal-500/20">
            MK
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              MediKing <span className="text-xs bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-500/30">ERP</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Hospital & Pharmacy Web Management</p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Staff Secure Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a demo role or enter your institutional credentials
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@mediking.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Role Picker for Testing */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Quick Login by Role:</span>
              <span className="text-[10px] text-teal-400 font-normal">One-Click Autofill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@mediking.com', 'admin123')}
                className="p-2 text-left bg-slate-900/70 hover:bg-slate-900 rounded-lg border border-slate-700/60 hover:border-purple-500/50 transition group"
              >
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
                  <ShieldCheck size={14} />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Super Admin</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('pharmacist@mediking.com', 'pharma123')}
                className="p-2 text-left bg-slate-900/70 hover:bg-slate-900 rounded-lg border border-slate-700/60 hover:border-teal-500/50 transition group"
              >
                <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold">
                  <Pill size={14} />
                  <span>Pharmacist</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">POS & Stock</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('doctor@mediking.com', 'doctor123')}
                className="p-2 text-left bg-slate-900/70 hover:bg-slate-900 rounded-lg border border-slate-700/60 hover:border-blue-500/50 transition group"
              >
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                  <Stethoscope size={14} />
                  <span>Doctor</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">OPD & Rx</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('reception@mediking.com', 'recep123')}
                className="p-2 text-left bg-slate-900/70 hover:bg-slate-900 rounded-lg border border-slate-700/60 hover:border-amber-500/50 transition group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <UserCheck size={14} />
                  <span>Reception</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Token & Reg</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('lab@mediking.com', 'lab123')}
                className="p-2 text-left bg-slate-900/70 hover:bg-slate-900 rounded-lg border border-slate-700/60 hover:border-emerald-500/50 transition group"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <FlaskConical size={14} />
                  <span>Lab Tech</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Test Reports</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('accountant@mediking.com', 'acc123')}
                className="p-2 text-left bg-slate-900/70 hover:bg-slate-900 rounded-lg border border-slate-700/60 hover:border-indigo-500/50 transition group"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
                  <Receipt size={14} />
                  <span>Accountant</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Billing / Cash</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] text-slate-400">
          MediKing Health System • Next-Gen Hospital & Pharmacy Web ERP
        </div>
      </div>
    </div>
  );
}

