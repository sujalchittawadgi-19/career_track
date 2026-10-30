import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import InterviewCard from '../components/interviews/InterviewCard';
import InterviewModal from '../components/interviews/InterviewModal';
import Select from '../components/common/Select';
import { Video, Calendar, Clock, Filter, RefreshCw } from 'lucide-react';

const OUTCOME_FILTERS = [
  { value: 'all', label: 'All Outcomes' },
  { value: 'Pending', label: 'Pending / Scheduled' },
  { value: 'Passed', label: 'Passed / Advanced' },
  { value: 'Failed', label: 'Failed' },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'All Round Types' },
  { value: 'OA', label: 'Online Assessment' },
  { value: 'Screening', label: 'Screening' },
  { value: 'Technical', label: 'Technical / Coding' },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'HR', label: 'HR / Fit' },
];

const InterviewsPage = () => {
  const { showToast } = useToast();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Edit modal
  const [editingInterview, setEditingInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (outcomeFilter !== 'all') params.append('outcome', outcomeFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const res = await api.get(`/interviews?${params.toString()}`);
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      showToast('Failed to load interview rounds.', 'error');
    } finally {
      setLoading(false);
    }
  }, [outcomeFilter, typeFilter, showToast]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleOutcomeChange = async (interviewId, outcome) => {
    try {
      await api.put(`/interviews/${interviewId}`, { outcome });
      showToast(`Outcome set to ${outcome}`, 'success');
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, outcome } : i))
      );
    } catch (err) {
      showToast('Failed to update outcome.', 'error');
    }
  };

  const handleDelete = async (interview) => {
    try {
      await api.delete(`/interviews/${interview.id}`);
      showToast('Interview round deleted.', 'success');
      setInterviews((prev) => prev.filter((i) => i.id !== interview.id));
    } catch (err) {
      showToast('Failed to delete interview.', 'error');
    }
  };

  // Partition upcoming vs past
  const now = new Date();
  const upcoming = interviews.filter((i) => new Date(i.scheduled_at) >= now);
  const past = interviews.filter((i) => new Date(i.scheduled_at) < now);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Video className="w-7 h-7 text-brand-400" />
            Interview Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological agenda of upcoming technical loops, recruiter screenings, and past debriefs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              options={OUTCOME_FILTERS}
            />
          </div>

          <div className="w-40">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={TYPE_FILTERS}
            />
          </div>

          <button
            onClick={fetchInterviews}
            className="p-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {interviews.length === 0 ? (
        <div className="py-20 text-center bg-dark-800/40 rounded-2xl border border-slate-800 space-y-2">
          <Video className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No scheduled interviews found</p>
          <p className="text-xs text-slate-500">
            Schedule an interview round on any application page to track it here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Section */}
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
                <h3 className="text-base font-bold text-slate-100">
                  Upcoming Rounds ({upcoming.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((inv) => (
                  <InterviewCard
                    key={inv.id}
                    interview={inv}
                    onEdit={(item) => {
                      setEditingInterview(item);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    onOutcomeChange={handleOutcomeChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Section */}
          {past.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-400">
                Past Rounds & Debriefs ({past.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((inv) => (
                  <InterviewCard
                    key={inv.id}
                    interview={inv}
                    onEdit={(item) => {
                      setEditingInterview(item);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    onOutcomeChange={handleOutcomeChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Interview Modal */}
      {editingInterview && (
        <InterviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingInterview(null);
          }}
          onSaved={fetchInterviews}
          applicationId={editingInterview.application_id}
          interview={editingInterview}
        />
      )}
    </div>
  );
};

export default InterviewsPage;
