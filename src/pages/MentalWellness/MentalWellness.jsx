import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Droplets, Moon, Activity, BookOpen, Plus, Calendar, Smile, Frown, Meh, Save } from 'lucide-react';

export const MentalWellness = () => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Today's log entry
  const [todayLog, setTodayLog] = useState({
    water_glasses: 0,
    sleep_hours: '',
    exercise_minutes: '',
    mood: 'Okay',
    notes: ''
  });

  const moods = [
    { label: 'Great', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { label: 'Okay', icon: Meh, color: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-200' },
    { label: 'Poor', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-100', border: 'border-rose-200' }
  ];

  useEffect(() => {
    if (!user) return;
    loadWellnessLogs();
  }, [user]);

  const loadWellnessLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wellness_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error loading wellness logs:', err);
      addToast('Error', 'Could not load wellness history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Error', 'Please log in to save your wellness log', 'error');
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        water_glasses: parseInt(todayLog.water_glasses) || 0,
        sleep_hours: parseFloat(todayLog.sleep_hours) || null,
        exercise_minutes: parseInt(todayLog.exercise_minutes) || null,
        mood: todayLog.mood,
        notes: todayLog.notes
      };

      const { data, error } = await supabase
        .from('wellness_logs')
        .insert([payload])
        .select();

      if (error) throw error;

      setLogs([data[0], ...logs]);
      setTodayLog({ water_glasses: 0, sleep_hours: '', exercise_minutes: '', mood: 'Okay', notes: '' });
      addToast('Success', 'Daily wellness log saved!', 'success');
    } catch (err) {
      console.error('Error saving wellness log:', err);
      addToast('Error', 'Could not save wellness log', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-500" /> Mental Wellness & Daily Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily water intake, sleep, exercise, and mood to maintain your well-being
          </p>
        </div>
      </div>

      {/* Logging Form */}
      <div className="p-6 rounded-3xl glass-card border border-purple-100 dark:border-purple-900/30 shadow-pastel bg-white dark:bg-slate-900">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-500" />
          Log Today's Wellness
        </h2>

        <form onSubmit={handleSaveLog} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Water Glasses */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-sky-500" />
                Water Glasses
              </label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setTodayLog(p => ({...p, water_glasses: Math.max(0, p.water_glasses - 1)}))} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">-</button>
                <span className="text-xl font-bold w-8 text-center">{todayLog.water_glasses}</span>
                <button type="button" onClick={() => setTodayLog(p => ({...p, water_glasses: p.water_glasses + 1}))} className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">+</button>
              </div>
            </div>

            {/* Sleep Hours */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Moon className="w-4 h-4 text-indigo-500" />
                Sleep Hours
              </label>
              <input 
                type="number" step="0.5" min="0" max="24"
                placeholder="e.g. 7.5"
                value={todayLog.sleep_hours}
                onChange={(e) => setTodayLog({...todayLog, sleep_hours: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            {/* Exercise Minutes */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
                Exercise Minutes
              </label>
              <input 
                type="number" min="0" step="5"
                placeholder="e.g. 30"
                value={todayLog.exercise_minutes}
                onChange={(e) => setTodayLog({...todayLog, exercise_minutes: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

          </div>

          {/* Mood */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Overall Mood</label>
            <div className="flex flex-wrap gap-4">
              {moods.map((m) => (
                <button
                  type="button"
                  key={m.label}
                  onClick={() => setTodayLog({...todayLog, mood: m.label})}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                    todayLog.mood === m.label 
                    ? `${m.bg} ${m.border} ${m.color}`
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              Journal / Notes
            </label>
            <textarea
              value={todayLog.notes}
              onChange={(e) => setTodayLog({...todayLog, notes: e.target.value})}
              placeholder="What went well today? Any concerns?"
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-y"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Wellness Log
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 mt-8">
          <Calendar className="w-5 h-5 text-slate-400" />
          Previous Records
        </h3>

        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => {
              const moodConfig = moods.find(m => m.label === log.mood) || moods[1];
              const MoodIcon = moodConfig.icon;
              const logDate = new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <div key={log.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-400 mb-2">{logDate}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1.5 rounded-lg ${moodConfig.bg} ${moodConfig.color}`}>
                          <MoodIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">{log.mood}</span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 md:pt-0">
                      <div className="text-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl min-w-[80px]">
                        <Droplets className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{log.water_glasses}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Glasses</div>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl min-w-[80px]">
                        <Moon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{log.sleep_hours || '-'}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hours</div>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl min-w-[80px]">
                        <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{log.exercise_minutes || '-'}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Minutes</div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Wellness Logs</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              You haven't logged your daily wellness yet. Tracking these metrics helps you and your care team see patterns over time.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
