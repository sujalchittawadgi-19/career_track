import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/common/StatCard';
import ApplicationVelocityChart from '../components/dashboard/ApplicationVelocityChart';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Layers,
  PieChart,
  Briefcase,
  Globe,
} from 'lucide-react';

const AnalyticsPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/summary');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        showToast('Failed to load analytics metrics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [showToast]);

  if (loading || !data) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Computing pipeline analytics & conversion funnels...</p>
      </div>
    );
  }

  const { kpi, stageBreakdown, conversionRates, weeklyVelocity, jobTypeDistribution, workModeDistribution } = data;

  // Funnel steps
  const funnelSteps = [
    { label: 'Applied', count: kpi.total_applications, color: 'bg-brand-500' },
    {
      label: 'Screening',
      count: (stageBreakdown.Screening || 0) + (stageBreakdown.Shortlisted || 0) + (stageBreakdown.Interviewing || 0) + (stageBreakdown.Offer || 0) + (stageBreakdown.Accepted || 0),
      color: 'bg-indigo-500',
    },
    {
      label: 'Interviewing',
      count: (stageBreakdown.Interviewing || 0) + (stageBreakdown.Offer || 0) + (stageBreakdown.Accepted || 0),
      color: 'bg-accent-amber',
    },
    {
      label: 'Offer',
      count: (stageBreakdown.Offer || 0) + (stageBreakdown.Accepted || 0),
      color: 'bg-accent-emerald',
    },
    {
      label: 'Accepted',
      count: stageBreakdown.Accepted || 0,
      color: 'bg-accent-cyan',
    },
  ];

  const maxFunnel = Math.max(...funnelSteps.map((s) => s.count), 1);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-brand-400" />
          Pipeline Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Stage-by-stage recruitment funnel conversions, weekly velocity, and distribution insights
        </p>
      </div>

      {/* Top Conversion Ratio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="App → Screening"
          value={`${conversionRates.appliedToScreening}%`}
          subtitle="Screening conversion"
          icon={Target}
          color="brand"
        />
        <StatCard
          title="Screening → Loop"
          value={`${conversionRates.screeningToInterview}%`}
          subtitle="Interview advancement"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Loop → Offer"
          value={`${conversionRates.interviewToOffer}%`}
          subtitle="Interview close rate"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Overall Success"
          value={`${conversionRates.overallSuccess}%`}
          subtitle="Application to Offer"
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Main Grid: Funnel & Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Conversion Funnel */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Recruitment Conversion Funnel
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Progression from initial submission to signed offer
            </p>

            <div className="space-y-4">
              {funnelSteps.map((step, idx) => {
                const widthPercent = Math.max((step.count / maxFunnel) * 100, 8);
                const stepConversion =
                  idx > 0 && funnelSteps[idx - 1].count > 0
                    ? Math.round((step.count / funnelSteps[idx - 1].count) * 100)
                    : 100;

                return (
                  <div key={step.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{step.label}</span>
                      <div className="flex items-center gap-3">
                        {idx > 0 && (
                          <span className="text-[11px] text-slate-400">
                            {stepConversion}% from prev
                          </span>
                        )}
                        <span className="font-extrabold text-slate-100 bg-dark-750 px-2 py-0.5 rounded border border-slate-700">
                          {step.count}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-dark-750 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${step.color} shadow-sm`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Velocity Chart */}
        <div>
          <ApplicationVelocityChart weeklyData={weeklyVelocity} />
        </div>
      </div>

      {/* Distributions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Type Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-slate-100">Job Type Distribution</h3>
          </div>

          <div className="space-y-3">
            {jobTypeDistribution.map((item) => {
              const total = kpi.total_applications || 1;
              const pct = Math.round((item.count / total) * 100);

              return (
                <div key={item.job_type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{item.job_type}</span>
                    <span className="text-slate-400">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-dark-750 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent-cyan h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Work Mode Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-accent-purple" />
            <h3 className="text-base font-bold text-slate-100">Work Mode Breakdown</h3>
          </div>

          <div className="space-y-3">
            {workModeDistribution.map((item) => {
              const total = kpi.total_applications || 1;
              const pct = Math.round((item.count / total) * 100);

              return (
                <div key={item.work_mode} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{item.work_mode}</span>
                    <span className="text-slate-400">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-dark-750 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent-purple h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
