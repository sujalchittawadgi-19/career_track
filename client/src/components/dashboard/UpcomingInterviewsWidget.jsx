import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

const UpcomingInterviewsWidget = ({ interviews = [], loading = false }) => {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-3 min-h-[220px]">
        <div className="h-4 w-32 bg-dark-700 rounded animate-pulse" />
        <div className="h-16 bg-dark-700/50 rounded-xl animate-pulse" />
        <div className="h-16 bg-dark-700/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-amber/15 text-accent-amber border border-accent-amber/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Upcoming Interviews</h3>
              <p className="text-[11px] text-slate-400">Scheduled in next 7 days</p>
            </div>
          </div>
          <Link
            to="/interviews"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div className="py-8 text-center bg-dark-750/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-xs text-slate-400 font-medium">No upcoming rounds in next 7 days</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Scheduled interviews will show here with one-click launch links
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {interviews.slice(0, 4).map((item) => {
              const d = new Date(item.scheduled_at);
              const formattedDate = d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-dark-750/70 border border-slate-700/50 hover:border-brand-500/40 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.company_logo ? (
                      <img
                        src={item.company_logo}
                        alt={item.company_name}
                        className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1 border border-slate-700 flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                        {item.company_name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {item.company_name}
                        </span>
                        <Badge variant="primary" size="sm">
                          {item.round_type}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {item.round_title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-right">
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-200">{formattedDate}</span>
                      <span className="text-[11px] text-slate-400">{formattedTime}</span>
                    </div>

                    {item.meeting_link && (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-brand-600/20 text-brand-400 hover:bg-brand-600 hover:text-white border border-brand-500/30 transition shadow-sm"
                        title="Launch Meeting"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                    )}
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

export default UpcomingInterviewsWidget;
