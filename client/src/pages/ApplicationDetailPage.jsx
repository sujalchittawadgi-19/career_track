import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import StatusPill from '../components/applications/StatusPill';
import ApplicationModal from '../components/applications/ApplicationModal';
import InterviewModal from '../components/interviews/InterviewModal';
import InterviewCard from '../components/interviews/InterviewCard';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Globe,
  FileText,
  Video,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  MessageSquare,
  Clock,
  ExternalLink,
  CheckCircle2,
  Send,
} from 'lucide-react';

const STAGES = [
  'Wishlist',
  'Applied',
  'Screening',
  'Shortlisted',
  'Interviewing',
  'Offer',
  'Accepted',
];

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'interviews' | 'notes' | 'resume'

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Note form state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.application);
      }
    } catch (err) {
      showToast('Failed to load application details.', 'error');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleStageChange = async (newStatus) => {
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
      setApplication((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      showToast('Failed to update stage.', 'error');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    try {
      setIsAddingNote(true);
      const res = await api.post(`/applications/${id}/notes`, { content: newNoteContent });
      if (res.data.success) {
        showToast('Note added.', 'success');
        setNewNoteContent('');
        setApplication((prev) => ({
          ...prev,
          notes: [res.data.note, ...(prev.notes || [])],
        }));
      }
    } catch (err) {
      showToast('Failed to add note.', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/applications/${id}/notes/${noteId}`);
      showToast('Note removed.', 'success');
      setApplication((prev) => ({
        ...prev,
        notes: (prev.notes || []).filter((n) => n.id !== noteId),
      }));
    } catch (err) {
      showToast('Failed to delete note.', 'error');
    }
  };

  const handleInterviewOutcomeChange = async (interviewId, outcome) => {
    try {
      await api.put(`/interviews/${interviewId}`, { outcome });
      showToast(`Outcome updated to ${outcome}`, 'success');
      setApplication((prev) => ({
        ...prev,
        interviews: (prev.interviews || []).map((i) =>
          i.id === interviewId ? { ...i, outcome } : i
        ),
      }));
    } catch (err) {
      showToast('Failed to update outcome.', 'error');
    }
  };

  const handleDeleteInterview = async (interview) => {
    try {
      await api.delete(`/interviews/${interview.id}`);
      showToast('Interview round deleted.', 'success');
      setApplication((prev) => ({
        ...prev,
        interviews: (prev.interviews || []).filter((i) => i.id !== interview.id),
      }));
    } catch (err) {
      showToast('Failed to delete interview round.', 'error');
    }
  };

  const confirmDeleteApplication = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/applications/${id}`);
      showToast('Application deleted successfully.', 'success');
      navigate('/applications');
    } catch (err) {
      showToast('Failed to delete application.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!application?.resume_id) return;
    try {
      const res = await api.get(`/resumes/${application.resume_id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = application.resume_file_name || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Failed to download resume file.', 'error');
    }
  };

  if (loading || !application) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading application details...</p>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(application.status);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {application.company_logo ? (
              <img
                src={application.company_logo}
                alt={application.company_name}
                className="w-14 h-14 rounded-2xl object-contain bg-white/5 p-2 border border-slate-700 flex-shrink-0 shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-dark-700 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-200 flex-shrink-0">
                {application.company_name?.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  {application.job_title}
                </h1>
                <StatusPill status={application.status} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5 font-medium">
                <span className="text-slate-200 font-bold text-sm">
                  {application.company_name}
                </span>
                {application.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {application.location}
                  </span>
                )}
                {application.company_website && (
                  <a
                    href={application.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stage Transition Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Stage:</span>
            <select
              value={application.status}
              onChange={(e) => handleStageChange(e.target.value)}
              className="text-xs font-bold bg-dark-750 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer shadow-md"
            >
              {[
                'Wishlist',
                'Applied',
                'Screening',
                'Shortlisted',
                'Interviewing',
                'Offer',
                'Accepted',
                'Rejected',
                'Withdrawn',
                'Archived',
              ].map((stg) => (
                <option key={stg} value={stg} className="bg-dark-800">
                  {stg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 10-Stage Visual Stepper */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
            {STAGES.map((stg, index) => {
              const isPastOrCurrent = currentStageIndex >= index;
              const isCurrent = application.status === stg;

              return (
                <div
                  key={stg}
                  onClick={() => handleStageChange(stg)}
                  className={`flex-1 min-w-[90px] flex flex-col items-center gap-1.5 cursor-pointer group transition`}
                >
                  <div
                    className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'bg-brand-500 shadow-md shadow-brand-500/50'
                        : isPastOrCurrent
                        ? 'bg-brand-600/70'
                        : 'bg-dark-700 group-hover:bg-slate-700'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold tracking-tight transition ${
                      isCurrent
                        ? 'text-brand-300'
                        : isPastOrCurrent
                        ? 'text-slate-300'
                        : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {stg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-px">
        {[
          { id: 'overview', label: 'Role Overview', count: null },
          { id: 'interviews', label: 'Interview Loops', count: application.interviews?.length },
          { id: 'notes', label: 'Notes & Log', count: application.notes?.length },
          { id: 'resume', label: 'Attached Resume', count: application.resume_file_name ? 1 : 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-dark-700 text-slate-300">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key metadata */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Job Description & Strategy Notes
              </h3>
              {application.description ? (
                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {application.description}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">No description logged for this role.</p>
              )}

              {application.application_url && (
                <div className="pt-4 border-t border-slate-700/50">
                  <a
                    href={application.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition"
                  >
                    View Original Job Posting <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats sidebar */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-slate-700/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Details
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Job Type</span>
                  <span className="font-semibold text-slate-200">{application.job_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Work Mode</span>
                  <span className="font-semibold text-slate-200">{application.work_mode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Salary Target</span>
                  <span className="font-bold text-accent-emerald">
                    {application.salary_min || application.salary_max
                      ? `$${(application.salary_min / 1000).toFixed(0)}k – $${(
                          application.salary_max / 1000
                        ).toFixed(0)}k`
                      : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Applied Date</span>
                  <span className="font-semibold text-slate-200">
                    {application.applied_date ? application.applied_date.split('T')[0] : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Deadline / OA</span>
                  <span className="font-semibold text-accent-amber">
                    {application.deadline_date ? application.deadline_date.split('T')[0] : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Interview Loops</h3>
              <p className="text-xs text-slate-400">
                Track round agendas, preparation notes, and meeting links
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingInterview(null);
                setIsInterviewModalOpen(true);
              }}
            >
              Schedule Round
            </Button>
          </div>

          {application.interviews?.length === 0 ? (
            <div className="py-16 text-center bg-dark-800/40 rounded-2xl border border-slate-800 space-y-3">
              <Video className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No interview rounds scheduled yet</p>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingInterview(null);
                  setIsInterviewModalOpen(true);
                }}
              >
                Schedule First Round
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.interviews.map((item) => (
                <InterviewCard
                  key={item.id}
                  interview={item}
                  showCompany={false}
                  onEdit={(inv) => {
                    setEditingInterview(inv);
                    setIsInterviewModalOpen(true);
                  }}
                  onDelete={handleDeleteInterview}
                  onOutcomeChange={handleInterviewOutcomeChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes & Log Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Note input */}
          <form onSubmit={handleAddNote} className="glass-card rounded-2xl p-4 border border-slate-700/60 space-y-3">
            <textarea
              rows="3"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a preparation note, recruiter email highlight, or compensation update..."
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm placeholder:text-slate-500 resize-none focus:outline-none"
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                isLoading={isAddingNote}
                disabled={!newNoteContent.trim()}
              >
                Post Note
              </Button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-3">
            {application.notes?.length === 0 ? (
              <div className="py-12 text-center bg-dark-800/40 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500">No notes posted yet.</p>
              </div>
            ) : (
              application.notes.map((note) => (
                <div
                  key={note.id}
                  className="glass-card rounded-xl p-4 border border-slate-700/60 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-200">{note.author_name || 'Candidate'}</span>
                      <span>•</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-slate-500 hover:text-accent-rose transition opacity-0 group-hover:opacity-100"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {application.resume_file_name || 'No resume version linked'}
                </h3>
                <p className="text-xs text-slate-400">
                  {application.resume_file_size
                    ? `${(application.resume_file_size / (1024 * 1024)).toFixed(2)} MB PDF Document`
                    : 'Attach a PDF from your Document Vault to track submitted versions.'}
                </p>
              </div>
            </div>

            {application.resume_id ? (
              <button
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl transition shadow-md"
              >
                Download PDF
              </button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                Link Resume
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={fetchApplicationDetails}
        application={application}
      />

      {/* Schedule Interview Modal */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false);
          setEditingInterview(null);
        }}
        onSaved={fetchApplicationDetails}
        applicationId={id}
        interview={editingInterview}
      />

      {/* Delete Application Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteApplication}
        title="Delete Application Record"
        message={`Are you sure you want to permanently delete this application for "${application.job_title}" at "${application.company_name}"?`}
        confirmText="Yes, Delete Application"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ApplicationDetailPage;
