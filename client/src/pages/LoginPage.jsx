import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Briefcase, Mail, Lock, Sparkles, Shield, User } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(formData.email, formData.password);
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      showToast('Logged in with demo credentials!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-brand-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
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
          <h2 className="text-2xl font-bold text-slate-100">Sign in to your workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Manage applications, interviews, and offer deadlines</p>
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
              label="Email Address"
              name="email"
              type="email"
              placeholder="candidate@careertrack.dev"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
              autoFocus
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login shortcuts */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Fast Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('user@careertrack.dev', 'Candidate@12345')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition"
              >
                <User className="w-3.5 h-3.5 text-brand-400" />
                Candidate
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@careertrack.dev', 'Admin@12345')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition"
              >
                <Shield className="w-3.5 h-3.5 text-accent-cyan" />
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-400 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
