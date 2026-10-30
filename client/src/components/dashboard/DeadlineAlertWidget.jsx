import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, Calendar, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';

const DeadlineAlertWidget = ({ deadlines = [], loading = false }) => {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-3 min-h-[220px]">
        <div className="h-4 w-32 bg-dark-700 rounded animate-pulse" />
        <div className="h-16 bg-dark-700/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-rose/15 text-accent-rose border border-accent-rose/20">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Expiring Deadlines & OAs</h3>
              <p className="text-[11px] text-slate-400">Due within the next 5 days</p>
            </div>
          </div>
          <Link
            to="/applications"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {deadlines.length === 0 ? (
          <div className="py-8 text-center bg-dark-750/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-xs text-accent-emerald font-medium">All caught up!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              No online assessments or application deadlines expiring in the next 5 days.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {deadlines.slice(0, 4).map((item) => {
              const daysLeft = item.days_remaining;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-dark-750/70 border border-slate-700/50 hover:border-accent-rose/40 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {item.company_name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-700 text-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <Link
                        to={`/applications/${item.id}`}
                        className="text-xs text-slate-300 font-semibold truncate hover:text-brand-300 transition"
                      >
                        {item.job_title}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        daysLeft <= 1
                          ? 'bg-accent-rose/20 text-accent-rose border-accent-rose/40 animate-pulse'
                          : daysLeft <= 3
                          ? 'bg-accent-amber/15 text-accent-amber border-accent-amber/30'
                          : 'bg-brand-500/15 text-brand-300 border-brand-500/30'
                      }`}
                    >
                      {daysLeft === 0
                        ? 'Due Today!'
                        : daysLeft === 1
                        ? 'Due Tomorrow'
                        : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeadlineAlertWidget;
