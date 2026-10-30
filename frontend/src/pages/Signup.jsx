import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse } from 'lucide-react';
import api from '../services/api';

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/signup', form);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account.');
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
          <div><h1 className="text-2xl font-bold text-slate-950">Create your account</h1><p className="text-sm text-slate-500">Request staff access to MediKing</p></div>
        </div>
        {message ? (
          <div className="space-y-4 rounded-xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-950">
            <p>{message}</p>
            <button onClick={() => navigate('/login')} className="font-semibold underline">Return to sign in</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
            {[
              ['name', 'Full name', 'text'],
              ['username', 'Username', 'text'],
              ['email', 'Email address', 'email'],
              ['phone', 'Phone (optional)', 'tel'],
              ['password', 'Password (at least 6 characters)', 'password'],
            ].map(([name, label, type]) => (
              <label key={name} className="block text-sm font-medium text-slate-700">
                {label}
                <input
                  required={name !== 'phone'}
                  minLength={name === 'password' ? 6 : undefined}
                  autoComplete={name === 'password' ? 'new-password' : name}
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={updateField}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>
            ))}
            <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Your account will remain inactive until an administrator approves it and assigns access.</p>
            <button disabled={submitting} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              {submitting ? 'Creating account…' : 'Request an account'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
