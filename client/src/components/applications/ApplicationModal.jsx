import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import { Building2, Briefcase, DollarSign, Globe, Calendar, FileText } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Wishlist', label: 'Wishlist' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Screening', label: 'Screening' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Interviewing', label: 'Interviewing' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
  { value: 'Archived', label: 'Archived' },
];

const JOB_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Freelance', label: 'Freelance' },
];

const WORK_MODES = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
];

const ApplicationModal = ({ isOpen, onClose, onSaved, application = null }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);

  const isEditing = Boolean(application && application.id);

  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    status: 'Applied',
    job_type: 'Full-time',
    work_mode: 'Remote',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    application_url: '',
    applied_date: new Date().toISOString().split('T')[0],
    deadline_date: '',
    resume_id: '',
    description: '',
  });

  // Fetch available resumes for the dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/resumes')
        .then((res) => {
          if (res.data.success) {
            setResumes(res.data.resumes || []);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name || '',
        job_title: application.job_title || '',
        status: application.status || 'Applied',
        job_type: application.job_type || 'Full-time',
        work_mode: application.work_mode || 'Remote',
        location: application.location || '',
        salary_min: application.salary_min || '',
        salary_max: application.salary_max || '',
        salary_currency: application.salary_currency || 'USD',
        application_url: application.application_url || '',
        applied_date: application.applied_date ? application.applied_date.split('T')[0] : '',
        deadline_date: application.deadline_date ? application.deadline_date.split('T')[0] : '',
        resume_id: application.resume_id || '',
        description: application.description || '',
      });
    } else {
      setFormData({
        company_name: '',
        job_title: '',
        status: 'Applied',
        job_type: 'Full-time',
        work_mode: 'Remote',
        location: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        application_url: '',
        applied_date: new Date().toISOString().split('T')[0],
        deadline_date: '',
        resume_id: '',
        description: '',
      });
    }
  }, [application, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company_name.trim() || !formData.job_title.trim()) {
      showToast('Please provide both company name and job title.', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/applications/${application.id}`, formData);
        showToast('Application updated successfully!', 'success');
      } else {
        await api.post('/applications', formData);
        showToast('Application logged in seconds!', 'success');
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to save application.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resumeOptions = [
    { value: '', label: 'None (No resume attached)' },
    ...resumes.map((r) => ({
      value: r.id,
      label: `${r.file_name} (${r.tag || 'General'})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Application Record' : 'Log New Application'}
      subtitle={isEditing ? 'Update stage, compensation, or interview loop info' : 'Log details in under 30 seconds'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Company & Job Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            name="company_name"
            placeholder="e.g. Stripe, Google, OpenAI"
            value={formData.company_name}
            onChange={handleChange}
            icon={Building2}
            required
            autoFocus
          />
          <Input
            label="Job Title"
            name="job_title"
            placeholder="e.g. Full Stack Software Engineer"
            value={formData.job_title}
            onChange={handleChange}
            icon={Briefcase}
            required
          />
        </div>

        {/* Row 2: Status, Job Type, Work Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Lifecycle Stage"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            required
          />
          <Select
            label="Job Type"
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            options={JOB_TYPES}
            required
          />
          <Select
            label="Work Mode"
            name="work_mode"
            value={formData.work_mode}
            onChange={handleChange}
            options={WORK_MODES}
            required
          />
        </div>

        {/* Row 3: Location, Min Salary, Max Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Location"
            name="location"
            placeholder="e.g. Seattle, WA / Remote"
            value={formData.location}
            onChange={handleChange}
          />
          <Input
            label="Min Salary ($/yr)"
            name="salary_min"
            type="number"
            placeholder="e.g. 150000"
            value={formData.salary_min}
            onChange={handleChange}
            icon={DollarSign}
          />
          <Input
            label="Max Salary ($/yr)"
            name="salary_max"
            type="number"
            placeholder="e.g. 190000"
            value={formData.salary_max}
            onChange={handleChange}
            icon={DollarSign}
          />
        </div>

        {/* Row 4: Dates & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Applied Date"
            name="applied_date"
            type="date"
            value={formData.applied_date}
            onChange={handleChange}
            icon={Calendar}
          />
          <Input
            label="Target Deadline / OA Date"
            name="deadline_date"
            type="date"
            value={formData.deadline_date}
            onChange={handleChange}
            icon={Calendar}
            helperText="Tracks upcoming 5-day urgency reminders"
          />
        </div>

        {/* Row 5: Application URL & Resume Vault */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Posting URL"
            name="application_url"
            placeholder="https://company.com/careers/role-123"
            value={formData.application_url}
            onChange={handleChange}
            icon={Globe}
          />
          <Select
            label="Attached Resume Version"
            name="resume_id"
            value={formData.resume_id}
            onChange={handleChange}
            options={resumeOptions}
          />
        </div>

        {/* Row 6: Description / Notes */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Role Notes / Key Requirements
          </label>
          <textarea
            name="description"
            rows="3"
            className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm placeholder:text-slate-500 resize-none focus:outline-none"
            placeholder="Key skills, tech stack, referral details, recruiter contact notes..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Log Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicationModal;
