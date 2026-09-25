'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  X,
  Mail,
  Phone,
  Building,
  Lock,
  User,
  AlertCircle,
  Check,
} from 'lucide-react';
import { adminAPI } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/Toast';

interface IStaffUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin';
  savedDeliveryDetails?: {
    building?: string;
    room?: string;
    notes?: string;
  };
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<IStaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Central Cafeteria Tuck Office');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal/action state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const loadStaff = async () => {
    try {
      const res = await adminAPI.getStaffUsers();
      if (res.success && res.users) {
        setStaffList(res.users);
      }
    } catch (err: any) {
      console.error('Error fetching staff users:', err);
      toast.error('Failed to load administrator accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openCreateModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('+92 300 ');
    setDepartment('Central Cafeteria Tuck Office');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length > 0 && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminAPI.createStaffUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password || 'AdminPassword123!',
        phone: phone.trim(),
        department: department.trim(),
      });

      if (res.success) {
        toast.success(res.message || `Granted administrator access to ${name}`);
        setModalOpen(false);
        loadStaff();
      } else {
        setErrorMsg(res.error || 'Failed to grant admin access.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error granting admin access.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAccess = async (id: string, staffName: string) => {
    try {
      const res = await adminAPI.deleteStaffUser(id);
      if (res.success) {
        toast.success(`Revoked admin access for ${staffName}.`);
        loadStaff();
      } else {
        toast.error(res.error || 'Failed to revoke administrator access.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error revoking administrator access.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight">
            Admin Access & Staff
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage authorized staff members and grant dashboard management permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs shadow-xs self-start sm:self-auto transition-all"
        >
          <UserPlus size={15} strokeWidth={2.6} />
          <span>Grant Admin Access</span>
        </button>
      </div>

      {/* Security Info Card */}
      <div className="rounded-[22px] bg-canvas-soft border border-line p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-white text-leaf flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <ShieldCheck size={20} strokeWidth={2.4} />
        </div>
        <div className="text-xs">
          <p className="font-bold text-ink">Dashboard Access Privileges</p>
          <p className="text-muted text-[11px] mt-0.5 leading-relaxed">
            Staff members with Administrator access can manage live tuck shop orders, update inventory stock, view revenue reports, and invite other managers.
          </p>
        </div>
      </div>

      {/* Active Administrators Table & Cards */}
      <div className="bg-white rounded-[24px] border border-line/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-line/60 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-ink">
            Active Administrators ({staffList.length})
          </h2>
          <span className="text-[11px] text-muted">Authorized Campus Staff</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted">Loading administrator accounts...</div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">No staff accounts registered yet.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas-soft/80 text-muted uppercase text-[10px] font-extrabold tracking-wider border-b border-line">
                  <tr>
                    <th className="py-3 px-6">Administrator</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Assigned Office / Dept</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {staffList.map((staff) => {
                    const isSelf = currentUser?._id === staff._id;
                    const initial = staff.name
                      ? staff.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                      : 'AD';

                    return (
                      <tr key={staff._id} className="hover:bg-canvas-soft/40 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#16251F] text-lime font-black text-xs flex items-center justify-center shrink-0">
                              {initial}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-ink flex items-center gap-1.5">
                                <span>{staff.name}</span>
                                {isSelf && (
                                  <span className="px-2 py-0.5 rounded-full bg-leaf text-lime text-[10px] font-extrabold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-muted">{staff.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-ink">
                          {staff.phone || '—'}
                        </td>

                        <td className="py-3.5 px-4 text-muted font-medium">
                          {staff.savedDeliveryDetails?.building || 'Main Tuck Office'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] tracking-wider uppercase">
                            Admin
                          </span>
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-muted italic">Current session</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(staff._id)}
                              className="px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-line/60">
              {staffList.map((staff) => {
                const isSelf = currentUser?._id === staff._id;
                const initial = staff.name
                  ? staff.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'AD';

                return (
                  <div key={staff._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#16251F] text-lime font-bold text-xs flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-ink flex items-center gap-1.5">
                            <span>{staff.name}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full bg-leaf text-lime text-[9px] font-extrabold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted">{staff.email}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[9px] tracking-wider uppercase">
                        Admin
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                      <span>{staff.savedDeliveryDetails?.building || 'Main Tuck Office'}</span>
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => setDeletingId(staff._id)}
                          className="font-bold text-rose-600 hover:underline"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Grant Admin Access Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-line p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-[800] text-lg text-ink">Grant Admin Access</h3>
                <p className="text-xs text-muted mt-0.5">
                  Authorize a new staff member or promote an existing account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas-soft"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-muted uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Usman Tariq"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-muted uppercase">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usman@isb.comsats.edu.pk"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-muted uppercase">
                  Temporary Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="AdminPassword123!"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-muted uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-muted uppercase">
                  Office / Tuck Point
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Central Cafeteria Tuck Office"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="rounded-[16px] bg-canvas-soft p-3 text-[11px] text-muted">
                💡 If this email already exists as a student account, they will automatically be granted Administrator access.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-full border border-line font-bold text-xs text-muted hover:bg-canvas-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-lime font-bold text-xs text-ink hover:bg-[#cfe569] shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Granting Access...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Revoke Access */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-line p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-ink">Revoke Administrator Access?</h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to revoke dashboard management access for this staff member? Their account will revert to a standard customer account.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-full border border-line font-bold text-xs text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = staffList.find((s) => s._id === deletingId);
                  if (target) handleRevokeAccess(target._id, target.name);
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-600 font-bold text-xs text-white hover:bg-rose-700"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
