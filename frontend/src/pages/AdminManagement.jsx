import React, { useEffect, useState } from 'react';
import { Check, ShieldPlus, Users, UserRoundCog } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const staffRoles = [
  ['doctor', 'Doctor'],
  ['nurse', 'Nurse'],
  ['receptionist', 'Reception'],
  ['pharmacist', 'Pharmacy'],
  ['lab_tech', 'Lab technician'],
  ['lab_verifier', 'Lab verifier'],
  ['accountant', 'Accountant'],
  ['inventory_manager', 'Inventory'],
];

export default function AdminManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
      ]);
      setUsers(usersResponse.data.data);
      setRoles(rolesResponse.data.data);
      setSelectedRoles((current) => Object.fromEntries(
        usersResponse.data.data.map((staff) => [staff._id, current[staff._id] || staff.role])
      ));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load staff and role settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveAccess = async (staff) => {
    setError('');
    setNotice('');
    try {
      await api.patch(`/users/${staff._id}/access`, {
        role: selectedRoles[staff._id],
        isApproved: true,
        isActive: true,
      });
      setNotice(`Access updated for ${staff.name}.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update staff access.');
    }
  };

  const toggleActive = async (staff) => {
    setError('');
    setNotice('');
    try {
      await api.patch(`/users/${staff._id}/access`, { isActive: !staff.isActive });
      setNotice(`${staff.name} is now ${staff.isActive ? 'inactive' : 'active'}.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this account.');
    }
  };

  const createRole = async (event) => {
    event.preventDefault();
    setSavingRole(true);
    setError('');
    setNotice('');
    try {
      await api.post('/users/roles', { name: roleName, permissions });
      setRoleName('');
      setPermissions([]);
      setNotice('Custom role created.');
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create the role.');
    } finally {
      setSavingRole(false);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const assignableRoles = [
    ...(isSuperAdmin ? [['hospital_admin', 'Administrator']] : []),
    ...staffRoles,
    ...roles.map((role) => [role.slug, role.name]),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">Access control</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Staff & roles</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50/80">Approve staff accounts and grant access by role. Only the super admin can grant administrator access.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{notice}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800"><Users size={20} /></div>
          <div><h2 className="font-semibold text-slate-900">Staff accounts</h2><p className="text-xs text-slate-500">Pending sign-ups appear first.</p></div>
        </div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading staff accounts…</p> : users.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No staff accounts found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((staff) => (
              <div key={staff._id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_190px_auto] sm:items-center sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{staff.name}</p>
                  <p className="truncate text-xs text-slate-500">{staff.email} · @{staff.username}</p>
                  <div className="mt-1 flex gap-2 text-[11px]">
                    <span className={staff.isApproved ? 'text-teal-800' : 'font-semibold text-amber-700'}>
                      {staff.isApproved ? 'Approved' : 'Awaiting approval'}
                    </span>
                    <span className={staff.isActive ? 'text-slate-500' : 'font-semibold text-rose-700'}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <select
                  aria-label={`Role for ${staff.name}`}
                  value={selectedRoles[staff._id] || staff.role}
                  disabled={!isSuperAdmin && ['super_admin', 'hospital_admin'].includes(staff.role)}
                  onChange={(event) => setSelectedRoles({ ...selectedRoles, [staff._id]: event.target.value })}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {assignableRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveAccess(staff)}
                    disabled={!isSuperAdmin && ['super_admin', 'hospital_admin'].includes(staff.role)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    <Check size={14} /> {staff.isApproved ? 'Save access' : 'Approve'}
                  </button>
                  {staff.isApproved && (
                    <button onClick={() => toggleActive(staff)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      {staff.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <form onSubmit={createRole} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-800"><ShieldPlus size={20} /></div>
            <div><h2 className="font-semibold text-slate-900">Create a role</h2><p className="text-xs text-slate-500">Choose the staff areas this role can use.</p></div>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Role name
            <input required value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="e.g. Front desk supervisor" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" />
          </label>
          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-medium text-slate-700">Access areas</legend>
            <div className="grid grid-cols-2 gap-2">
              {staffRoles.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={permissions.includes(key)}
                    onChange={() => setPermissions((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key])}
                    className="accent-teal-700"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <button disabled={savingRole} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            <ShieldPlus size={16} /> {savingRole ? 'Creating…' : 'Create role'}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800"><UserRoundCog size={20} /></div>
            <div><h2 className="font-semibold text-slate-900">Available roles</h2><p className="text-xs text-slate-500">Custom roles can be assigned to staff.</p></div>
          </div>
          <ul className="space-y-2">
            {staffRoles.map(([slug, label]) => (
              <li key={slug} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm text-slate-700">
                <span>{label}</span><span className="text-[10px] uppercase tracking-wide text-slate-400">Built-in</span>
              </li>
            ))}
            {roles.map((role) => (
              <li key={role._id} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm text-slate-700">
                <span>{role.name}</span><span className="text-[10px] uppercase tracking-wide text-teal-700">Custom</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
