import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import UpcomingInterviewsWidget from '../components/dashboard/UpcomingInterviewsWidget';
import DeadlineAlertWidget from '../components/dashboard/DeadlineAlertWidget';
import ApplicationVelocityChart from '../components/dashboard/ApplicationVelocityChart';
import StatusPill from '../components/applications/StatusPill';
import {
  Layers,
  Clock,
  Video,
  Award,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const outletContext = useOutletContext();
  const refreshKey = outletContext?.refreshKey || 0;
  const openAddModal = outletContext?.openAddModal;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, interviewsRes, appsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/interviews/upcoming?days=7'),
        api.get('/applications?limit=5&sort_by=created_at&order=DESC'),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data);
      }
      if (interviewsRes.data.success) {
        setUpcomingInterviews(interviewsRes.data.upcomingInterviews || []);
      }
      if (appsRes.data.success) {
        setRecentApplications(appsRes.data.applications || []);
      }
    } catch (err) {
      showToast('Failed to load dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const kpi = analytics?.kpi || {
    total_applications: 0,
    active_applications: 0,
    interviewing_count: 0,
    offer_count: 0,
    rejected_count: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header / Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Welcome back, <span className="text-gradient">{user?.full_name}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is your live application pipeline, upcoming interview loops, and action alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openAddModal}
            className="shadow-lg shadow-brand-600/25"
          >
            Log Application
          </Button>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Apps"
          value={kpi.total_applications}
          icon={Layers}
          color="brand"
          subtitle="All recorded roles"
        />
        <StatCard
          title="Active Pipeline"
          value={kpi.active_applications}
          icon={Clock}
          color="brand"
          subtitle="In active stages"
        />
        <StatCard
          title="Interviewing"
          value={kpi.interviewing_count}
          icon={Video}
          color="amber"
          subtitle="Live interview loops"
        />
        <StatCard
          title="Offers Received"
          value={kpi.offer_count}
          icon={Award}
          color="emerald"
          subtitle="Ready to review/sign"
        />
        <StatCard
          title="Rejections"
          value={kpi.rejected_count}
          icon={XCircle}
          color="rose"
          subtitle="Archived or closed"
        />
      </div>

      {/* Main Grid: Upcoming Interviews & Expiring Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingInterviewsWidget
          interviews={upcomingInterviews}
          loading={loading}
        />
        <DeadlineAlertWidget
          deadlines={analytics?.expiringDeadlines || []}
          loading={loading}
        />
      </div>

      {/* Lower Grid: Weekly Velocity Chart & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Velocity Chart (1/3) */}
        <div className="lg:col-span-1">
          <ApplicationVelocityChart weeklyData={analytics?.weeklyVelocity || []} />
        </div>

        {/* Recent Applications (2/3) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Recent Applications</h3>
                  <p className="text-[11px] text-slate-400">Latest pipeline updates</p>
                </div>
              </div>

              <Link
                to="/applications"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
              >
                View Pipeline <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="py-12 text-center bg-dark-750/30 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400 font-medium">No applications logged yet.</p>
                <button
                  onClick={openAddModal}
                  className="mt-2 text-xs font-bold text-brand-400 hover:underline"
                >
                  + Log your first application
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {app.company_logo ? (
                        <img
                          src={app.company_logo}
                          alt={app.company_name}
                          className="w-7 h-7 rounded-lg object-contain bg-white/5 p-1 border border-slate-700 flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                          {app.company_name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col truncate">
                        <Link
                          to={`/applications/${app.id}`}
                          className="text-xs font-bold text-slate-200 hover:text-brand-300 transition truncate"
                        >
                          {app.job_title}
                        </Link>
                        <span className="text-[11px] text-slate-400">{app.company_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusPill status={app.status} size="xs" />
                      <Link
                        to={`/applications/${app.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-100 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
