import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Wind, Timer, BookOpen, Sparkles, Play, Pause, RotateCcw, Plus } from 'lucide-react';

export const MentalWellness = () => {
  const { addToast } = useTheme();

  // Affirmations Carousel
  const affirmations = [
    "My body is resilient, and every cell is supported in its healing journey.",
    "I release worry for tomorrow and choose peace for this present moment.",
    "Small steps taken with calm patience lead to grand recoveries.",
    "I am surrounding myself with love, gentle care, and unwavering strength."
  ];
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  // Guided Breathing State (4-7-8 Technique)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale (4s)'); // 'Inhale' | 'Hold' | 'Exhale'
  const [breathTimer, setBreathTimer] = useState(4);

  // Meditation Timer State
  const [meditationTimeLeft, setMeditationTimeLeft] = useState(300); // 5 mins default
  const [isMeditationRunning, setIsMeditationRunning] = useState(false);

  // Mood & Gratitude Journals
  const [gratitudeList, setGratitudeList] = useState([
    "Grateful for the morning sunlight through my window.",
    "Thankful for my sister bringing fresh ginger tea.",
    "Appreciating today's calm energy and good rest."
  ]);
  const [newGratitude, setNewGratitude] = useState('');

  // Breathing Cycle effect
  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            if (breathPhase.startsWith('Inhale')) {
              setBreathPhase('Hold (7s)');
              return 7;
            } else if (breathPhase.startsWith('Hold')) {
              setBreathPhase('Exhale (8s)');
              return 8;
            } else {
              setBreathPhase('Inhale (4s)');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('Inhale (4s)');
      setBreathTimer(4);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // Meditation Timer effect
  useEffect(() => {
    let timer = null;
    if (isMeditationRunning && meditationTimeLeft > 0) {
      timer = setInterval(() => {
        setMeditationTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (meditationTimeLeft === 0) {
      setIsMeditationRunning(false);
      addToast('Meditation Completed', 'Namaste. Take a soft deep breath as you return.', 'success');
    }
    return () => clearInterval(timer);
  }, [isMeditationRunning, meditationTimeLeft]);

  const addGratitude = (e) => {
    e.preventDefault();
    if (!newGratitude.trim()) return;
    setGratitudeList(prev => [newGratitude, ...prev]);
    setNewGratitude('');
    addToast('Gratitude Recorded', 'Your joyful thought has been saved to your journal.', 'success');
  };

  const formatMeditationTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-500" /> Mental Wellness & Mindfulness
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Guided breathing exercises, meditation timers, daily affirmations & gratitude journals
          </p>
        </div>
      </div>

      {/* Daily Affirmation Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-indigo-500/15 border border-purple-200/50 dark:border-purple-800/30 glass-card text-center relative overflow-hidden">
        <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2 animate-bounce" />
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-300 block mb-2">
          Daily Healing Affirmation
        </span>
        <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 max-w-2xl mx-auto italic leading-relaxed">
          "{affirmations[affirmationIdx]}"
        </p>

        <div className="flex items-center justify-center gap-2 mt-4">
          {affirmations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setAffirmationIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${affirmationIdx === idx ? 'w-8 bg-purple-600' : 'bg-purple-200 dark:bg-purple-900'}`}
            />
          ))}
        </div>
      </div>

      {/* Grid: 4-7-8 Breathing Circle + Meditation Timer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guided Breathing Circle */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel flex flex-col items-center justify-between text-center">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">4-7-8 Guided Breathing</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">Reduces nerve anxiety and relaxes muscle tension</p>

          {/* Animated Breathing Circle */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <div className={`
              w-36 h-36 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-300 to-purple-400 opacity-80 flex items-center justify-center text-white font-extrabold shadow-2xl transition-all duration-1000
              ${isBreathingActive ? (breathPhase.startsWith('Inhale') ? 'scale-125' : breathPhase.startsWith('Hold') ? 'scale-125 opacity-100' : 'scale-90') : 'scale-100'}
            `}>
              <div className="text-center">
                <span className="text-2xl font-bold block">{breathTimer}s</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{breathPhase}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className={`w-full py-3 rounded-2xl font-semibold text-xs transition-all shadow-md ${
              isBreathingActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
            }`}
          >
            {isBreathingActive ? 'Stop Breathing Exercise' : 'Start 4-7-8 Breathing'}
          </button>
        </div>

        {/* Meditation Timer */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel flex flex-col items-center justify-between text-center">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Meditation & Calm Timer</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">Mindful stillness & restorative music</p>

          {/* Large Digital Timer */}
          <div className="my-6">
            <span className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wider">
              {formatMeditationTime(meditationTimeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setIsMeditationRunning(!isMeditationRunning)}
              className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2"
            >
              {isMeditationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isMeditationRunning ? 'Pause' : 'Start Meditation'}
            </button>
            <button
              onClick={() => {
                setIsMeditationRunning(false);
                setMeditationTimeLeft(300);
              }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gratitude & Mood Journal */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> Gratitude & Mood Journal
        </h3>

        <form onSubmit={addGratitude} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Write a small joyful moment or gratitude today..."
            value={newGratitude}
            onChange={(e) => setNewGratitude(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
          <button type="submit" className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Log Journal
          </button>
        </form>

        <div className="space-y-2">
          {gratitudeList.map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-400 fill-purple-400 flex-shrink-0" />
              <span>"{item}"</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
