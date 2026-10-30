import React from 'react';
import { Link } from 'react-router-dom';
import StatusPill, { STATUS_CONFIG } from './StatusPill';
import {
  Building2,
  Calendar,
  DollarSign,
  Video,
  ArrowRight,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';

const KANBAN_COLUMNS = [
  'Wishlist',
  'Applied',
  'Screening',
  'Shortlisted',
  'Interviewing',
  'Offer',
  'Accepted',
  'Rejected',
];

const KanbanBoard = ({
  applications = [],
  onStatusChange,
  onEditApp,
  onDeleteApp,
}) => {
  // Group applications by status
  const columnsMap = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col] = applications.filter((app) => app.status === col);
    return acc;
  }, {});

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1350px] items-start">
        {KANBAN_COLUMNS.map((colName) => {
          const colApps = columnsMap[colName] || [];
          const config = STATUS_CONFIG[colName] || STATUS_CONFIG.Applied;

          return (
            <div
              key={colName}
              className="flex-1 min-w-[280px] max-w-[320px] bg-dark-800/60 border border-slate-700/60 rounded-2xl p-3 flex flex-col gap-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {colName}
                  </h4>
                </div>
                <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-dark-700 text-slate-300 border border-slate-600/60">
                  {colApps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {colApps.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium">No applications</p>
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      className="glass-card p-3.5 rounded-xl flex flex-col gap-2.5 border border-slate-700/60 hover:border-brand-500/40 transition group cursor-pointer"
                    >
                      {/* Top Header: Company + Action */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {app.company_logo ? (
                            <img
                              src={app.company_logo}
                              alt={app.company_name}
                              className="w-6 h-6 rounded-md object-contain bg-white/5 p-0.5 border border-slate-700"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-dark-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                              {app.company_name?.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[150px]">
                            {app.company_name}
                          </span>
                        </div>

                        {/* Quick Stage Mover Dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) => onStatusChange(app.id, e.target.value)}
                          className="text-[10px] bg-dark-750 text-slate-300 border border-slate-700 rounded-lg px-2 py-0.5 focus:outline-none focus:border-brand-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {KANBAN_COLUMNS.map((stage) => (
                            <option key={stage} value={stage} className="bg-dark-800">
                              Move → {stage}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Job Title */}
                      <Link
                        to={`/applications/${app.id}`}
                        className="text-sm font-bold text-slate-100 group-hover:text-brand-300 transition line-clamp-2"
                      >
                        {app.job_title}
                      </Link>

                      {/* Details row: Job Type, Work Mode, Salary */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-dark-700/80 text-slate-300">
                          {app.job_type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-dark-700/80 text-slate-300">
                          {app.work_mode}
                        </span>
                        {app.salary_max && (
                          <span className="text-accent-emerald font-semibold flex items-center gap-0.5">
                            ${(app.salary_max / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>

                      {/* Footer: Date & Interviews count */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {app.applied_date ? app.applied_date.split('T')[0] : 'Not logged'}
                        </span>

                        {app.total_interviews > 0 && (
                          <span className="flex items-center gap-1 text-accent-amber font-semibold">
                            <Video className="w-3 h-3" />
                            {app.total_interviews} round{app.total_interviews > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
