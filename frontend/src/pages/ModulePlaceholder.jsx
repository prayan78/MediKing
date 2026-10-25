import React from 'react';
import { ArrowRight, Construction, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ModulePlaceholder({ title, description, icon: Icon, phase, highlights = [] }) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            {Icon && <Icon size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {phase}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Starting ${title} quick workflow...`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus size={14} />
            <span>New Action</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            Module Architecture & MediKing Workflows
          </h2>
          <div className="space-y-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {i + 1}
                </span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access & Permissions</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="text-slate-700 font-semibold">Active User Role:</div>
              <div className="text-teal-700 font-bold capitalize mt-0.5">{user?.role?.replace('_', ' ')}</div>
              <div className="text-[11px] text-slate-400 mt-2">Server-side authorization enforced on API endpoints.</div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs">
            <div className="font-bold flex items-center gap-1.5 text-teal-300">
              <Construction size={14} /> MediKing Roadmap
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Phased delivery following strict ERP modular architecture. Database schemas, seeds, and API routes are live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
