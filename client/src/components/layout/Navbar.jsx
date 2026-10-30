import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import {
  Briefcase,
  Plus,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const Navbar = ({ onOpenAddModal, onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-700/60 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          aria-label="Toggle Navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-brand-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Career<span className="text-gradient">Track</span>
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        {onOpenAddModal && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex"
          >
            Log Application
          </Button>
        )}

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-dark-750 transition border border-transparent hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white text-xs font-bold shadow-md">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-200 leading-tight">
                {user?.full_name}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {user?.target_role || (isAdmin ? 'Administrator' : 'Job Seeker')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-700/60">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-xs font-bold text-slate-200 truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-md border border-accent-cyan/20">
                    <Shield className="w-3 h-3" /> System Admin
                  </span>
                )}
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-dark-700 hover:text-white transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-accent-cyan hover:bg-accent-cyan/10 transition"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Console
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-700/60 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-accent-rose hover:bg-accent-rose/10 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
