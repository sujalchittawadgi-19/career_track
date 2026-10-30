import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Layers,
  Calendar,
  BarChart3,
  FileCheck2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Database,
  Lock,
} from 'lucide-react';
import Button from '../components/common/Button';

const STAGES = [
  'Wishlist',
  'Applied',
  'Screening',
  'Shortlisted',
  'Interviewing',
  'Offer',
  'Accepted',
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 h-16 flex items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-brand-400" />
            </div>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Career<span className="text-gradient">Track</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Open Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 sm:px-12 max-w-6xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-bold mb-6 animate-fade-in shadow-lg shadow-brand-500/10">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          Production-Grade Job & Internship Tracker
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight max-w-4xl leading-[1.15] mb-6">
          Take command of your <span className="text-gradient">hiring pipeline</span> with zero missed deadlines.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          The single source of truth for students, fresh graduates, and active job seekers. Log applications in 30 seconds, monitor 7-day interview agendas, and maximize offer conversions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to={isAuthenticated ? '/dashboard' : '/register'}>
            <Button size="lg" variant="primary" icon={ArrowRight}>
              Launch Workspace Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary" icon={Lock}>
              Demo Quick Login
            </Button>
          </Link>
        </div>

        {/* 10-Stage Lifecycle Visualizer */}
        <div className="w-full mt-16 p-6 rounded-2xl glass-card border border-slate-700/60 shadow-2xl">
          <div className="flex items-center justify-between mb-4 text-left">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                10-Stage State Machine
              </h3>
              <p className="text-sm font-extrabold text-slate-200">
                Structured recruitment pipeline from Wishlist to Offer
              </p>
            </div>
            <span className="text-xs font-semibold text-accent-emerald bg-accent-emerald/10 px-2.5 py-1 rounded-lg border border-accent-emerald/20">
              Automated State Transitions
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {STAGES.map((stg, i) => (
              <React.Fragment key={stg}>
                <div className="px-3.5 py-2 rounded-xl bg-dark-750 border border-slate-700/80 text-xs font-bold text-slate-200 shadow-md">
                  {stg}
                </div>
                {i < STAGES.length - 1 && (
                  <span className="text-slate-600 font-bold hidden sm:inline">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Engineered for high-volume job searches
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Eliminate spreadsheets, lost resume versions, and buried recruiter emails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">30-Second Rapid Logging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capture company, role, work mode, compensation, and deadlines in under 30 seconds with intuitive auto-completion.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber border border-accent-amber/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">7-Day Interview Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep upcoming technical loops, system design sessions, and OA deadlines prominently displayed above the fold.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Funnel Conversion Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track conversion ratios at every stage: Applications → Screening → Interviews → Offers to refine your search strategy.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple border border-accent-purple/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Kanban & Table Switcher</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly switch between an interactive drag-and-drop Kanban pipeline board and a high-density tabular view.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">PDF Document Vault</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload targeted resume versions with magic byte verification and associate specific PDF documents to applications.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-700/60 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">PostgreSQL 3NF Backbone</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built on a normalized relational database with parameterized queries, B-Tree indexes, and role-based permissions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-dark-900 py-10 px-6 sm:px-12 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-500" />
            <span className="font-bold text-slate-300">CareerTrack Platform</span>
            <span>— Production Grade Job Application Hub</span>
          </div>
          <div>React 18 • Node.js • Express • PostgreSQL • JWT</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
