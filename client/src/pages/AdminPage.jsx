import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/common/StatCard';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Shield,
  Users,
  Layers,
  Video,
  Award,
  Search,
  CheckCircle,
  XCircle,
  Power,
  RefreshCw,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active Users' },
  { value: 'suspended', label: 'Suspended Users' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'user', label: 'Candidate (user)' },
  { value: 'admin', label: 'Admin (admin)' },
];

const AdminPage = () => {
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter === 'active' ? 'true' : 'false');
      if (roleFilter !== 'all') params.append('role', roleFilter);
      params.append('page', page.toString());
      params.append('limit', '15');

      const [metricsRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get(`/admin/users?${params.toString()}`),
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.metrics);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
        setPagination(usersRes.data.pagination);
      }
    } catch (err) {
      showToast('Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter, page, showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, {
        is_active: !user.is_active,
      });

      if (res.data.success) {
        showToast(res.data.message, 'success');
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
        );
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to update user status.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-accent-cyan" />
          System Administration Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Platform-wide user directory, status controls, and aggregate system metrics
        </p>
      </div>

      {/* Aggregate System Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Platform Users"
          value={metrics?.total_users || 0}
          icon={Users}
          color="brand"
          subtitle={`${metrics?.active_users || 0} Active`}
        />
        <StatCard
          title="Total Apps Logged"
          value={metrics?.total_applications || 0}
          icon={Layers}
          color="brand"
          subtitle="System-wide"
        />
        <StatCard
          title="Interviews Held"
          value={metrics?.total_interviews || 0}
          icon={Video}
          color="amber"
          subtitle="All rounds"
        />
        <StatCard
          title="Offers Generated"
          value={metrics?.total_offers || 0}
          icon={Award}
          color="emerald"
          subtitle="Job offers"
        />
        <StatCard
          title="Resumes Vault"
          value={metrics?.total_resumes || 0}
          icon={Shield}
          color="purple"
          subtitle="Stored PDF docs"
        />
      </div>

      {/* User Management Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">User Registry</h3>
            <p className="text-xs text-slate-400">View and manage candidate accounts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={STATUS_OPTIONS}
              />
            </div>
            <div className="w-36">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={ROLE_OPTIONS}
              />
            </div>
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-750 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-100 text-sm">{u.full_name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        u.role === 'admin'
                          ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.is_active
                          ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                          : 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.is_active ? 'bg-accent-emerald' : 'bg-accent-rose'
                        }`}
                      />
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {u.target_role || <span className="text-slate-500">—</span>}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {u.total_applications} apps
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
                        u.is_active
                          ? 'bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose border-accent-rose/30'
                          : 'bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {u.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} users)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
