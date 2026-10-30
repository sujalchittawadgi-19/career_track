import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Layers,
} from 'lucide-react';

const ResumesPage = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag] = useState('Full Stack 2026');

  // Delete modal
  const [deletingResume, setDeletingResume] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (err) {
      showToast('Failed to load resumes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF documents are allowed.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5 MB limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('tag', tag || 'General');

    try {
      setUploading(true);
      const res = await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast('Resume uploaded and verified!', 'success');
        fetchResumes();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to upload PDF.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingResume) return;

    try {
      setIsDeleting(true);
      await api.delete(`/resumes/${deletingResume.id}`);
      showToast('Resume removed from vault.', 'success');
      setDeletingResume(null);
      fetchResumes();
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (resume) => {
    try {
      const res = await api.get(`/resumes/${resume.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.file_name || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Failed to download resume file.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <FileCheck2 className="w-7 h-7 text-brand-400" />
          Document Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload and tag PDF resumes (max 5 MB). Link specific resume versions to applications.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Upload New Resume PDF</h3>
            <p className="text-xs text-slate-400">Strict magic-byte header validation enabled (max 5 MB)</p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Tag (e.g. Backend Focus, General)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-brand-500/60 rounded-2xl p-8 text-center cursor-pointer transition bg-dark-750/30 hover:bg-brand-500/5 group flex flex-col items-center justify-center gap-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">
              {uploading ? 'Validating & Uploading PDF...' : 'Click to select or drag and drop PDF'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Strictly PDF only • Maximum 5 MB</p>
          </div>
        </div>
      </div>

      {/* Uploaded Resumes List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100">
          Stored Resume Versions ({resumes.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading vault records...</div>
        ) : resumes.length === 0 ? (
          <div className="py-16 text-center bg-dark-800/40 rounded-2xl border border-slate-800">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No resumes stored yet</p>
            <p className="text-xs text-slate-500">Upload a PDF above to attach it to job applications</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      {r.tag || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {(r.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 truncate" title={r.file_name}>
                    {r.file_name}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(r.uploaded_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-brand-400" />
                      {r.applications_linked} app{r.applications_linked !== 1 ? 's' : ''} linked
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  <button
                    onClick={() => handleDownload(r)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-dark-750 hover:bg-dark-700 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>

                  <button
                    onClick={() => setDeletingResume(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingResume)}
        onClose={() => setDeletingResume(null)}
        onConfirm={confirmDelete}
        title="Delete Resume Version"
        message={`Are you sure you want to delete "${deletingResume?.file_name}"? Any applications currently linking to this resume will retain their data, with the resume link unassigned.`}
        confirmText="Yes, Delete PDF"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ResumesPage;
