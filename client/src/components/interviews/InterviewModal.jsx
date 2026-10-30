import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import { Video, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

const ROUND_TYPES = [
  { value: 'OA', label: 'Online Assessment (OA)' },
  { value: 'Screening', label: 'Recruiter Screening' },
  { value: 'Technical', label: 'Technical / Coding Round' },
  { value: 'Behavioral', label: 'Behavioral / Leadership' },
  { value: 'HR', label: 'HR / Culture Fit' },
  { value: 'Final', label: 'Final / Executive Loop' },
];

const OUTCOME_OPTIONS = [
  { value: 'Pending', label: 'Pending / Scheduled' },
  { value: 'Passed', label: 'Passed / Advanced' },
  { value: 'Failed', label: 'Failed / Did Not Pass' },
];

const InterviewModal = ({
  isOpen,
  onClose,
  onSaved,
  applicationId,
  interview = null,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(interview && interview.id);

  const [formData, setFormData] = useState({
    round_title: '',
    round_type: 'Technical',
    scheduled_at: '',
    meeting_link: '',
    interviewer_name: '',
    outcome: 'Pending',
    notes: '',
  });

  useEffect(() => {
    if (interview) {
      let formattedDate = '';
      if (interview.scheduled_at) {
        // Convert to local datetime-local format YYYY-MM-DDTHH:mm
        const d = new Date(interview.scheduled_at);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }

      setFormData({
        round_title: interview.round_title || '',
        round_type: interview.round_type || 'Technical',
        scheduled_at: formattedDate,
        meeting_link: interview.meeting_link || '',
        interviewer_name: interview.interviewer_name || '',
        outcome: interview.outcome || 'Pending',
        notes: interview.notes || '',
      });
    } else {
      // Default to tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const defaultDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        round_title: '',
        round_type: 'Technical',
        scheduled_at: defaultDate,
        meeting_link: '',
        interviewer_name: '',
        outcome: 'Pending',
        notes: '',
      });
    }
  }, [interview, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.round_title.trim() || !formData.scheduled_at) {
      showToast('Please enter a round title and scheduled date/time.', 'warning');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
      };

      if (isEditing) {
        await api.put(`/interviews/${interview.id}`, payload);
        showToast('Interview round updated!', 'success');
      } else {
        await api.post(`/applications/${applicationId}/interviews`, payload);
        showToast('Interview round scheduled! Application moved to Interviewing.', 'success');
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to save interview round.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Interview Round' : 'Schedule Interview Round'}
      subtitle="Track your interview timeline, debrief notes, and meeting links"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Round Title"
          name="round_title"
          placeholder="e.g. System Design Loop, Technical Deep-Dive"
          value={formData.round_title}
          onChange={handleChange}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Round Type"
            name="round_type"
            value={formData.round_type}
            onChange={handleChange}
            options={ROUND_TYPES}
            required
          />
          <Select
            label="Round Outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            options={OUTCOME_OPTIONS}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            name="scheduled_at"
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={handleChange}
            icon={Calendar}
            required
          />
          <Input
            label="Interviewer Name / Title"
            name="interviewer_name"
            placeholder="e.g. Marcus Chen (Staff Architect)"
            value={formData.interviewer_name}
            onChange={handleChange}
            icon={User}
          />
        </div>

        <Input
          label="Meeting URL (Zoom / Google Meet / Teams)"
          name="meeting_link"
          placeholder="https://zoom.us/j/123456789"
          value={formData.meeting_link}
          onChange={handleChange}
          icon={Video}
        />

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Debrief Notes / Questions Asked
          </label>
          <textarea
            name="notes"
            rows="3"
            className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm placeholder:text-slate-500 resize-none focus:outline-none"
            placeholder="Key algorithms tested, interviewer questions, follow-up items..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Schedule Round'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InterviewModal;
