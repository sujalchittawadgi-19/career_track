import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

const ApplicationVelocityChart = ({ weeklyData = [] }) => {
  // Find max count for normalization
  const maxCount = Math.max(...weeklyData.map((d) => d.count), 5);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Application Velocity</h3>
            <p className="text-[11px] text-slate-400">Weekly submission volume (Past 8 Weeks)</p>
          </div>
        </div>
      </div>

      {weeklyData.length === 0 ? (
        <div className="py-12 text-center bg-dark-750/30 rounded-xl border border-dashed border-slate-800">
          <p className="text-xs text-slate-400">No application submissions recorded in past 8 weeks</p>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 pt-6 pb-2 px-2 h-44">
          {weeklyData.map((week, idx) => {
            const heightPercent = Math.max((week.count / maxCount) * 100, 10);
            const weekLabel = week.week_start
              ? new Date(week.week_start).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
              : `W${idx + 1}`;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Count tooltip on hover */}
                <div className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-700 px-1.5 py-0.5 rounded shadow">
                  {week.count}
                </div>

                {/* Animated bar */}
                <div className="w-full max-w-[36px] bg-dark-750 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 group-hover:from-brand-500 group-hover:to-cyan-400 transition-all duration-300 rounded-t-lg shadow-lg shadow-brand-500/20"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Week label */}
                <span className="text-[10px] font-medium text-slate-400 truncate w-full text-center">
                  {weekLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationVelocityChart;
