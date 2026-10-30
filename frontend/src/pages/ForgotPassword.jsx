import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HeartPulse } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send a reset link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link to="/login" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-800">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white"><HeartPulse size={23} /></div>
          <div><h1 className="text-2xl font-bold text-slate-950">Forgot password?</h1><p className="text-sm text-slate-500">We’ll email you a secure reset link.</p></div>
        </div>
        {message ? (
          <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-950">{message}</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </label>
            <button disabled={submitting} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              {submitting ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
