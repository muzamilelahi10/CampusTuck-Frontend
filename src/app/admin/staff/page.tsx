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

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminAPI.createStaffUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        department: department.trim(),
      });

      if (res.success) {
        toast.success(`Administrator account created for ${name}!`);
        setModalOpen(false);
        await loadStaff();
      } else {
        setErrorMsg(res.error || 'Failed to create staff account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while creating administrator account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (staffId === currentUser?._id) {
      toast.error('You cannot delete your own administrator account.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke administrative access for ${staffName}? They will no longer be able to access the dashboard.`)) {
      return;
    }

    setDeletingId(staffId);
    try {
      const res = await adminAPI.deleteStaffUser(staffId);
      if (res.success) {
        toast.success(`Revoked dashboard access for ${staffName}.`);
        await loadStaff();
      } else {
        toast.error(res.error || 'Failed to revoke access.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error revoking access.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <h1 className="text-2xl font-bold text-ink">Staff & Administrators</h1>
          <p className="text-xs text-muted mt-1">
            Manage authorized tuck shop team members who can access this admin workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="primary-button !min-h-[43px] !rounded-[12px] !text-xs !py-2 shadow-sm"
        >
          <UserPlus size={16} />
          <span>Add Admin / Staff Member</span>
        </button>
      </div>

      {/* Security Info Card */}
      <div className="p-4 rounded-2xl bg-[#F0F4E9] border border-[#DEE7D4] flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-leaf shrink-0 shadow-sm mt-0.5">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-xs font-bold text-ink">Administrative Workspace Access Control</h2>
          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
            Only users listed below can log into the CampusTuck Admin Workspace. Public students and customers cannot access this area. As an administrator, you have the authority to grant or revoke staff access at any time.
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="admin-card overflow-hidden !p-0">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-leaf" />
            <h2 className="text-sm font-bold text-ink">Active Dashboard Administrators</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-canvas-soft text-[11px] font-semibold text-leaf">
            {staffList.length} {staffList.length === 1 ? 'Admin' : 'Admins'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF8] border-b border-line text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5 font-bold">Administrator</th>
                <th className="py-3.5 px-4 font-bold">Email</th>
                <th className="py-3.5 px-4 font-bold">Phone</th>
                <th className="py-3.5 px-4 font-bold">Department / Office</th>
                <th className="py-3.5 px-4 font-bold">Role</th>
                <th className="py-3.5 px-4 font-bold">Joined</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    Loading administrator accounts...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const isSelf = staff._id === currentUser?._id;
                  const initial = staff.name ? staff.name.charAt(0).toUpperCase() : 'A';

                  return (
                    <tr key={staff._id} className="hover:bg-[#F9FAF6] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-lime text-ink font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-ink flex items-center gap-1.5">
                              <span>{staff.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EAF0E3] text-leaf">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted">Administrator</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-800">
                        {staff.email}
                      </td>

                      <td className="py-4 px-4 text-muted">
                        {staff.phone || '—'}
                      </td>

                      <td className="py-4 px-4 text-muted">
                        {staff.savedDeliveryDetails?.building || 'Main Administration Block'}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF0E3] text-leaf font-bold text-[10px]">
                          <ShieldCheck size={12} />
                          <span>Full Admin</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-muted text-[11px]">
                        {new Date(staff.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {isSelf ? (
                          <span className="text-[10px] text-muted italic">Active Session</span>
                        ) : (
                          <button
                            type="button"
                            disabled={deletingId === staff._id || staffList.length <= 1}
                            onClick={() => handleDeleteStaff(staff._id, staff.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            title="Revoke Admin Access"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime text-ink flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Add New Administrator</h2>
                  <p className="text-[11px] text-muted">Grant full dashboard access to a staff member.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Usman Ali"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:ring-2 focus:ring-leaf focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Campus Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usman.staff@isb.comsats.edu.pk"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:ring-2 focus:ring-leaf focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-muted">Must be an authorized CUI staff or administration email.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Initial Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:ring-2 focus:ring-leaf focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:ring-2 focus:ring-leaf focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Assigned Department / Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Central Cafeteria or Academic Block 2 Kiosk"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:ring-2 focus:ring-leaf focus:outline-none"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="secondary-button !min-h-[42px] !text-xs flex-1 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-button !min-h-[42px] !text-xs flex-1 text-center"
                >
                  {submitting ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
