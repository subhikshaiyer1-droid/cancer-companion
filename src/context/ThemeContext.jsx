import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cc_dark_mode') === 'true');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('cc_text_size') || 'normal'); // 'normal' | 'large'
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('cc_contrast') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('cc_language') || 'English');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('cc_voice') === 'true');

  const [toasts, setToasts] = useState([
    { id: 1, type: 'info', title: 'Welcome to Cancer Companion', message: 'Take a moment to track today’s symptoms and stay hydrated.' }
  ]);

  useEffect(() => {
    localStorage.setItem('cc_dark_mode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('cc_text_size', textSize);
    if (textSize === 'large') {
      document.body.classList.add('text-large');
    } else {
      document.body.classList.remove('text-large');
    }
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('cc_contrast', highContrast);
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('cc_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('cc_voice', voiceEnabled);
  }, [voiceEnabled]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Text to Speech Synthesizer Helper
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <ThemeContext.Provider value={{
      darkMode, setDarkMode,
      textSize, setTextSize,
      highContrast, setHighContrast,
      language, setLanguage,
      voiceEnabled, setVoiceEnabled,
      toasts, addToast, removeToast,
      speakText
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
