import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Mail, MapPin, Target, Globe, Shield, Save, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, isAdmin, userStats } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    target_role: user?.target_role || '',
    location: user?.location || '',
    bio: user?.bio || '',
    portfolio_url: user?.portfolio_url || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      showToast('Full name is required.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-brand-400" />
          My Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your career profile, target roles, and portfolio links
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Summary */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-brand-500/20">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100">{user?.full_name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
            {isAdmin ? <Shield className="w-3.5 h-3.5 text-accent-cyan" /> : <Target className="w-3.5 h-3.5" />}
            {isAdmin ? 'System Administrator' : user?.target_role || 'Job Seeker'}
          </div>

          {/* Quick stats in sidebar */}
          {userStats && (
            <div className="w-full pt-4 border-t border-slate-700/50 text-xs space-y-2 text-left">
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Total Applications</span>
                <span className="font-bold text-slate-200">{userStats.total_applications}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Active Stages</span>
                <span className="font-bold text-brand-300">{userStats.active_applications}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Interviews</span>
                <span className="font-bold text-accent-amber">{userStats.interviewing_count}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Profile Form */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              icon={User}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Role / Specialization"
                name="target_role"
                placeholder="e.g. Senior Backend Engineer"
                value={formData.target_role}
                onChange={handleChange}
                icon={Target}
              />
              <Input
                label="Location / Timezone"
                name="location"
                placeholder="e.g. New York, NY / Remote"
                value={formData.location}
                onChange={handleChange}
                icon={MapPin}
              />
            </div>

            <Input
              label="Portfolio / GitHub URL"
              name="portfolio_url"
              placeholder="https://github.com/username"
              value={formData.portfolio_url}
              onChange={handleChange}
              icon={Globe}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Bio & Career Objectives
              </label>
              <textarea
                name="bio"
                rows="4"
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm placeholder:text-slate-500 resize-none focus:outline-none"
                placeholder="Brief summary of your technical strengths, core stacks, and hiring preferences..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700/50">
              <Button type="submit" variant="primary" size="md" icon={Save} isLoading={loading}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
