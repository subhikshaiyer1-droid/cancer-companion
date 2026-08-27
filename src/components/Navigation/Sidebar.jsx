
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  Activity,
  Pill,
  Calendar,
  GitCommit,
  FileText,
  Apple,
  Heart,
  PhoneCall,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: Bot, badge: 'AI' },
    { id: 'symptoms', label: 'Symptom Tracker', icon: Activity },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'timeline', label: 'Treatment Timeline', icon: GitCommit },
    { id: 'reports', label: 'Health Reports', icon: FileText },
    { id: 'nutrition', label: 'Nutrition & Hydration', icon: Apple },
    { id: 'wellness', label: 'Mental Wellness', icon: Heart },
    { id: 'emergency', label: 'Emergency Contacts', icon: PhoneCall, highlight: true },
    { id: 'community', label: 'Community Support', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.splice(navItems.length - 1, 0, { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, badge: 'Admin' });
  }

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
          {/* Logo & App Branding */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-sky-400/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Cancer Companion
              </h1>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Calm Care Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                    ${isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 shadow-sm font-semibold'
                      : item.highlight
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Card & Logout */}
          <div className="pt-4 mt-6 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user?.name || 'Patient User'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.diagnosis || 'Treatment Journey'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
