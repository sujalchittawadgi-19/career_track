import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import {
  Briefcase,
  Mail,
  Lock,
  User,
  MapPin,
  Target,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    target_role: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Password validation criteria checks
  const pw = formData.password;
  const criteria = [
    { label: 'At least 8 characters', met: pw.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(pw) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(pw) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(pw) },
    { label: 'At least one special character (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
  ];

  const isPasswordValid = criteria.every((c) => c.met);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError('Please fulfill all password security criteria.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(formData);
      showToast('Account created successfully! Welcome to CareerTrack.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-brand-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <span className="text-xl font-black text-white">
              Career<span className="text-gradient">Track</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Create your candidate account</h2>
          <p className="text-xs text-slate-400 mt-1">Start tracking applications and preparing for interviews</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              placeholder="e.g. Alex Rivers"
              value={formData.full_name}
              onChange={handleChange}
              icon={User}
              required
              autoFocus
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            {/* Password validation indicators */}
            <div className="p-3.5 rounded-xl bg-dark-750/70 border border-slate-700/50 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password Security Requirements
              </p>
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {c.met ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={c.met ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Target Role"
                name="target_role"
                placeholder="e.g. Full Stack Engineer"
                value={formData.target_role}
                onChange={handleChange}
                icon={Target}
              />
              <Input
                label="Location"
                name="location"
                placeholder="e.g. Seattle / Remote"
                value={formData.location}
                onChange={handleChange}
                icon={MapPin}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={loading}
              disabled={!isPasswordValid}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
