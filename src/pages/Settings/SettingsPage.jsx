import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Moon, Sun, Globe, Volume2, Type, Eye, User, Shield, Check } from 'lucide-react';

export const SettingsPage = () => {
  const {
    darkMode, setDarkMode,
    textSize, setTextSize,
    highContrast, setHighContrast,
    language, setLanguage,
    voiceEnabled, setVoiceEnabled,
    addToast
  } = useTheme();

  const { user, updateProfile } = useAuth();

  const handleTextSizeToggle = (size) => {
    setTextSize(size);
    addToast('Text Size Updated', `Font size set to ${size}.`, 'info');
  };

  const handleContrastToggle = () => {
    const nextState = !highContrast;
    setHighContrast(nextState);
    addToast('High Contrast Mode', nextState ? 'High contrast enabled for maximum readability.' : 'Standard contrast restored.', 'info');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-8 h-8 text-sky-500" /> Platform Settings & Accessibility
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize dark mode, languages, font sizes, contrast, and voice assistance
        </p>
      </div>

      {/* Accessibility Options */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-500" /> Accessibility & Reading Support
        </h3>

        {/* Text Size */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">Font Size Scale</span>
            <span className="text-xs text-slate-500">Increase text size for improved legibility</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleTextSizeToggle('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${textSize === 'normal' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-500'}`}
            >
              Normal (16px)
            </button>
            <button
              onClick={() => handleTextSizeToggle('large')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${textSize === 'large' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-500'}`}
            >
              Large (18px)
            </button>
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">High Contrast Mode</span>
            <span className="text-xs text-slate-500">Enhance border contrast and element boundaries</span>
          </div>

          <button
            onClick={handleContrastToggle}
            className={`w-12 h-6 rounded-full transition-colors p-1 ${highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Voice Assistant Speech Reader */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-500" /> Voice Speech Reader
            </span>
            <span className="text-xs text-slate-500">Allow text-to-speech reading for messages & AI responses</span>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`w-12 h-6 rounded-full transition-colors p-1 ${voiceEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Theme & Language */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-500" /> Theme & Language Preferences
        </h3>

        {/* Dark Mode */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">Dark Mode</span>
            <span className="text-xs text-slate-500">Switch to soothing dark slate theme</span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors p-1 ${darkMode ? 'bg-sky-600' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">Interface Language</span>
            <span className="text-xs text-slate-500">Current language: {language}</span>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>
    </div>
  );
};
