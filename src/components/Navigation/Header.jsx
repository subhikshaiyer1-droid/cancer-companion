import React, { useState } from 'react';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Sun,
  Moon,
  PhoneCall,
  Bell,
  Globe,
  Volume2,
  VolumeX,
  ShieldAlert,
  X,
  Check
} from 'lucide-react';

export const Header = ({ onToggleSidebar, setActiveTab, onOpenAuth }) => {
  const {
    darkMode, setDarkMode,
    textSize, setTextSize,
    highContrast, setHighContrast,
    language, setLanguage,
    voiceEnabled, setVoiceEnabled,
    addToast
  } = useTheme();

  const { user, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const notificationsList = [
    { id: 1, title: 'Medicine Reminder', time: '08:00 AM', text: 'Ondansetron (Zofran) 8mg due now', unread: true },
    { id: 2, title: 'Upcoming Appointment', time: 'Aug 8', text: 'Dr. Sarah Lin (Oncology Consultation)', unread: true },
    { id: 3, title: 'Hydration Check-in', time: '2 hours ago', text: 'Drink a glass of water for recovery support', unread: false },
  ];

  const languages = ['English', 'Spanish', 'French', 'Hindi'];

  const triggerSos = () => {
    setShowSosModal(false);
    addToast('Emergency SOS Activated', 'Contacting Dr. Sarah Lin (+1 555-019-2831) and Oncology 24/7 Helpline.', 'warning');
    setActiveTab('emergency');
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors">
        {/* Left section: Hamburger button & Mode Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Personalized Healthcare Partner
            </span>
          </div>
        </div>

        {/* Right section: SOS Button, Language, Notifications, Accessibility */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* One-Tap Emergency SOS Button */}
          <button
            onClick={() => setShowSosModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition-all duration-200 animate-pulse-slow"
          >
            <PhoneCall className="w-4 h-4" />
            <span>SOS Emergency</span>
          </button>

          {/* Voice Reader Toggle */}
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              addToast(voiceEnabled ? 'Voice Reader Disabled' : 'Voice Reader Enabled', 'App content will now support voice text-to-speech.');
            }}
            title={voiceEnabled ? 'Voice reader enabled' : 'Enable voice reader'}
            className={`p-2 rounded-xl transition-colors ${
              voiceEnabled
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors">
              <Globe className="w-4 h-4 text-sky-500" />
              <span className="hidden md:inline">{language}</span>
            </button>

            <div className="absolute right-0 mt-1 w-36 py-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 hidden group-hover:block transition-all z-50">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="w-full px-3 py-1.5 text-xs text-left flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50"
                >
                  <span>{lang}</span>
                  {language === lang && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Reminders & Alerts</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-64 overflow-y-auto my-2">
                  {notificationsList.map(n => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-lg">
                      <div className="flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-300">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setActiveTab('medications');
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 transition-colors"
                >
                  View All Medications & Schedules
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          {!isAuthenticated && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* SOS Confirmation Dialog */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border-2 border-rose-500/50 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Initiate Emergency SOS Call?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              This will display your direct 1-tap contact buttons for Dr. Sarah Lin, your caregiver, and the 24/7 Oncology Emergency Hotline.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowSosModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={triggerSos}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
