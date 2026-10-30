import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import KanbanBoard from '../components/applications/KanbanBoard';
import ApplicationTable from '../components/applications/ApplicationTable';
import ApplicationModal from '../components/applications/ApplicationModal';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Stages' },
  { value: 'Wishlist', label: 'Wishlist' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Screening', label: 'Screening' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Interviewing', label: 'Interviewing' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

const JOB_TYPE_FILTERS = [
  { value: 'all', label: 'All Job Types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Part-time', label: 'Part-time' },
];

const WORK_MODE_FILTERS = [
  { value: 'all', label: 'All Work Modes' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
];

const ApplicationsPage = () => {
  const { showToast } = useToast();
  const outletContext = useOutletContext();
  const globalRefreshKey = outletContext?.refreshKey || 0;

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [workModeFilter, setWorkModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1, limit: 20 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (jobTypeFilter !== 'all') params.append('job_type', jobTypeFilter);
      if (workModeFilter !== 'all') params.append('work_mode', workModeFilter);
      params.append('sort_by', sortBy);
      params.append('order', sortOrder);

      if (viewMode === 'kanban') {
        params.append('all', 'true');
      } else {
        params.append('page', page.toString());
        params.append('limit', '20');
      }

      const res = await api.get(`/applications?${params.toString()}`);
      if (res.data.success) {
        setApplications(res.data.applications || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      showToast('Failed to load applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, jobTypeFilter, workModeFilter, sortBy, sortOrder, page, viewMode, showToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, globalRefreshKey]);

  // Handle stage change directly from Kanban or Table
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      showToast(`Moved to ${newStatus}`, 'success');
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      showToast('Failed to update stage.', 'error');
      fetchApplications();
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleDelete = (app) => {
    setDeletingApp(app);
  };

  const confirmDelete = async () => {
    if (!deletingApp) return;
    try {
      setIsDeleting(true);
      await api.delete(`/applications/${deletingApp.id}`);
      showToast('Application deleted successfully.', 'success');
      setDeletingApp(null);
      fetchApplications();
    } catch (err) {
      showToast('Failed to delete application.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(col);
      setSortOrder('ASC');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Title and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Applications Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track, filter, and advance jobs across all 10 recruitment lifecycle stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Kanban / Table Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-dark-800 border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
          >
            Log Application
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] max-w-md">
          <Input
            placeholder="Search by company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_FILTERS}
            />
          </div>

          <div className="w-36">
            <Select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              options={JOB_TYPE_FILTERS}
            />
          </div>

          <div className="w-36">
            <Select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              options={WORK_MODE_FILTERS}
            />
          </div>

          <button
            onClick={fetchApplications}
            className="p-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onEditApp={handleEdit}
          onDeleteApp={handleDelete}
        />
      ) : (
        <div className="space-y-4">
          <ApplicationTable
            applications={applications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
              <span>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
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
      )}

      {/* Edit / Add Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSaved={fetchApplications}
        application={editingApp}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        onConfirm={confirmDelete}
        title="Delete Application Record"
        message={`Are you sure you want to delete your application for "${deletingApp?.job_title}" at "${deletingApp?.company_name}"? All attached interview rounds and notes will also be removed.`}
        confirmText="Yes, Delete Application"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ApplicationsPage;
