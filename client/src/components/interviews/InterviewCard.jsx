import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
} from 'lucide-react';

const OUTCOME_CONFIG = {
  Pending: {
    label: 'Pending',
    variant: 'warning',
    icon: HelpCircle,
  },
  Passed: {
    label: 'Passed',
    variant: 'success',
    icon: CheckCircle2,
  },
  Failed: {
    label: 'Failed',
    variant: 'danger',
    icon: XCircle,
  },
};

const ROUND_TYPE_BADGES = {
  OA: 'cyan',
  Screening: 'purple',
  Technical: 'primary',
  Behavioral: 'amber',
  HR: 'default',
  Final: 'purple',
};

const InterviewCard = ({
  interview,
  onEdit,
  onDelete,
  onOutcomeChange,
  showCompany = true,
}) => {
  const outcomeInfo = OUTCOME_CONFIG[interview.outcome] || OUTCOME_CONFIG.Pending;
  const OutcomeIcon = outcomeInfo.icon;
  const roundBadgeColor = ROUND_TYPE_BADGES[interview.round_type] || 'default';

  const dateObj = new Date(interview.scheduled_at);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPast = dateObj < new Date();

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between gap-4 group">
      <div>
        {/* Top bar: Company & Type Badge */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant={roundBadgeColor} size="sm">
              {interview.round_type}
            </Badge>

            {showCompany && interview.company_name && (
              <Link
                to={`/applications/${interview.application_id}`}
                className="text-xs font-bold text-slate-300 hover:text-brand-300 transition flex items-center gap-1.5"
              >
                {interview.company_logo ? (
                  <img
                    src={interview.company_logo}
                    alt={interview.company_name}
                    className="w-4 h-4 rounded object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                )}
                {interview.company_name}
              </Link>
            )}
          </div>

          {/* Outcome toggle dropdown */}
          <select
            value={interview.outcome}
            onChange={(e) => onOutcomeChange && onOutcomeChange(interview.id, e.target.value)}
            className={`text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer border ${
              interview.outcome === 'Passed'
                ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30'
                : interview.outcome === 'Failed'
                ? 'bg-accent-rose/15 text-accent-rose border-accent-rose/30'
                : 'bg-accent-amber/15 text-accent-amber border-accent-amber/30'
            }`}
          >
            <option value="Pending" className="bg-dark-800 text-slate-200">
              Pending
            </option>
            <option value="Passed" className="bg-dark-800 text-slate-200">
              Passed
            </option>
            <option value="Failed" className="bg-dark-800 text-slate-200">
              Failed
            </option>
          </select>
        </div>

        {/* Round Title */}
        <h4 className="text-base font-bold text-slate-100 tracking-tight">
          {interview.round_title}
        </h4>

        {/* Job Title subtitle if company shown */}
        {showCompany && interview.job_title && (
          <p className="text-xs text-slate-400 mt-0.5">{interview.job_title}</p>
        )}

        {/* Timestamp */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {formattedTime}
          </span>
          {interview.interviewer_name && (
            <span className="text-xs text-slate-400 font-medium">
              with <strong className="text-slate-200">{interview.interviewer_name}</strong>
            </span>
          )}
        </div>

        {/* Notes preview */}
        {interview.notes && (
          <div className="mt-3 p-2.5 rounded-xl bg-dark-750/50 border border-slate-700/40 text-xs text-slate-300 leading-relaxed italic">
            "{interview.notes}"
          </div>
        )}
      </div>

      {/* Footer / Launch & Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div>
          {interview.meeting_link ? (
            <a
              href={interview.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 px-3 py-1.5 rounded-xl transition"
            >
              <Video className="w-3.5 h-3.5" />
              Launch Meeting <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-slate-500">No meeting link</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(interview)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
              title="Edit Round"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(interview)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition"
              title="Delete Round"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
