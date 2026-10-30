import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  User,
  PlusCircle,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onOpenAddModal }) => {
  const { isAdmin, userStats } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/applications',
      label: 'Applications',
      icon: Layers,
      badge: userStats?.active_applications,
    },
    {
      to: '/interviews',
      label: 'Interview Hub',
      icon: Calendar,
      badge: userStats?.interviewing_count,
    },
    {
      to: '/resumes',
      label: 'Document Vault',
      icon: FileText,
    },
    {
      to: '/analytics',
      label: 'Pipeline Analytics',
      icon: BarChart3,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: User,
    },
  ];

  if (isAdmin) {
    navItems.push({
      to: '/admin',
      label: 'Admin Console',
      icon: Shield,
      isAdminOnly: true,
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 glass-panel border-r border-slate-700/60 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div className="space-y-6">
          {/* Quick Add Application Action for Mobile/Sidebar */}
          {onOpenAddModal && (
            <button
              onClick={() => {
                onOpenAddModal();
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-600/25 transition-all active:scale-[0.98] sm:hidden"
            >
              <PlusCircle className="w-4 h-4" />
              Log New Application
            </button>
          )}

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Workspace
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      } ${item.isAdminOnly ? 'text-accent-cyan hover:text-accent-cyan' : ''}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/30 text-brand-300 border border-brand-500/40">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="p-3.5 rounded-xl bg-dark-800/80 border border-slate-700/60 mt-6">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Pipeline Status</span>
            <span className="text-accent-emerald font-semibold">Active</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            30-second rapid logging active
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
