import React from 'react';
import { Link } from 'react-router-dom';
import StatusPill from './StatusPill';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Video,
  ChevronRight,
} from 'lucide-react';

const ApplicationTable = ({
  applications = [],
  onEdit,
  onDelete,
  onStatusChange,
  sortBy,
  sortOrder,
  onSort,
}) => {
  if (applications.length === 0) {
    return (
      <div className="py-16 text-center bg-dark-800/40 rounded-2xl border border-slate-800">
        <p className="text-sm font-semibold text-slate-300">No applications found</p>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  const renderSortArrow = (col) => {
    if (sortBy !== col) return null;
    return <span className="ml-1 text-brand-400">{sortOrder === 'ASC' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-700/60 glass-panel shadow-xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-dark-750/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-700/60">
          <tr>
            <th
              className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition"
              onClick={() => onSort && onSort('company_name')}
            >
              Company & Role {renderSortArrow('company_name')}
            </th>
            <th
              className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition"
              onClick={() => onSort && onSort('status')}
            >
              Stage {renderSortArrow('status')}
            </th>
            <th className="py-3.5 px-4">Type & Mode</th>
            <th
              className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition"
              onClick={() => onSort && onSort('salary_max')}
            >
              Compensation {renderSortArrow('salary_max')}
            </th>
            <th
              className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition"
              onClick={() => onSort && onSort('applied_date')}
            >
              Applied Date {renderSortArrow('applied_date')}
            </th>
            <th
              className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition"
              onClick={() => onSort && onSort('deadline_date')}
            >
              Deadline / OA {renderSortArrow('deadline_date')}
            </th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {applications.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-white/[0.02] transition-colors group"
            >
              {/* Company & Role */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  {app.company_logo ? (
                    <img
                      src={app.company_logo}
                      alt={app.company_name}
                      className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1 border border-slate-700/80 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-dark-700 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                      {app.company_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <Link
                      to={`/applications/${app.id}`}
                      className="font-bold text-slate-100 group-hover:text-brand-300 transition text-sm flex items-center gap-1"
                    >
                      {app.job_title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">{app.company_name}</span>
                      {app.location && <span>• {app.location}</span>}
                    </div>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4">
                <StatusPill status={app.status} size="sm" />
              </td>

              {/* Type & Mode */}
              <td className="py-3.5 px-4">
                <div className="flex flex-col gap-0.5 text-[11px]">
                  <span className="text-slate-200 font-medium">{app.job_type}</span>
                  <span className="text-slate-400">{app.work_mode}</span>
                </div>
              </td>

              {/* Compensation */}
              <td className="py-3.5 px-4">
                {app.salary_min || app.salary_max ? (
                  <span className="font-bold text-accent-emerald text-xs">
                    {app.salary_min ? `$${(app.salary_min / 1000).toFixed(0)}k` : ''}
                    {app.salary_min && app.salary_max ? ' – ' : ''}
                    {app.salary_max ? `$${(app.salary_max / 1000).toFixed(0)}k` : ''}
                  </span>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>

              {/* Applied Date */}
              <td className="py-3.5 px-4 text-slate-300">
                {app.applied_date ? app.applied_date.split('T')[0] : <span className="text-slate-500">—</span>}
              </td>

              {/* Deadline */}
              <td className="py-3.5 px-4">
                {app.deadline_date ? (
                  <span className="inline-flex items-center gap-1 text-accent-amber font-semibold text-[11px] px-2 py-0.5 rounded-md bg-accent-amber/10 border border-accent-amber/20">
                    <Calendar className="w-3 h-3" />
                    {app.deadline_date.split('T')[0]}
                  </span>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/applications/${app.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
                    title="View Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onEdit(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition"
                    title="Edit Record"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
