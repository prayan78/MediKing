import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, HeartPulse, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitLogin = async (loginUsernameOrEmail, loginPassword) => {
    setSubmitting(true);
    setError('');
    try {
      await login(loginUsernameOrEmail, loginPassword);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    submitLogin(usernameOrEmail, password);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-16">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center lg:mx-0 lg:max-w-xl">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/15">
            <HeartPulse size={26} />
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">MediKing</p>
            <p className="text-xs font-medium tracking-wide text-slate-500">CARE, CONNECTED.</p>
          </div>
        </div>
        <div className="mb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <ShieldCheck size={14} /> Secure staff workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to continue to your hospital operations workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Username or email
            <span className="relative mt-2 block">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                autoComplete="username"
                required
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                placeholder="name@hospital.com"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </span>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <span className="relative mt-2 block">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                autoComplete="current-password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </span>
          </label>
          <div className="-mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-teal-800 hover:underline">Forgot password?</Link>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} />
          </button>
          {import.meta.env.DEV && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitLogin('admin@mediking.com', 'admin123')}
              className="w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Test admin login'}
            </button>
          )}
          <p className="text-center text-sm text-slate-600">
            Need an account? <Link to="/signup" className="font-semibold text-teal-800 hover:underline">Sign up</Link>
          </p>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">New accounts require administrator approval before access is enabled.</p>
      </section>

      <aside className="relative mt-12 hidden overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-4 top-16 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative z-10 mt-16 max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">One connected care team</p>
          <h2 className="mt-5 text-4xl font-bold leading-tight">A clearer view of every part of care.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-teal-50/80">
            Patient services, pharmacy, laboratory, and accounting—organized in one secure workspace.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-teal-100/70">
          <span>MediKing Health Systems</span><span>Staff access only</span>
        </div>
      </aside>
    </main>
  );
}
