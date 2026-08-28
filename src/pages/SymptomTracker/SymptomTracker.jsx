import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import {
  Activity, Plus, PlusCircle, AlertCircle, Calendar,
  ChevronRight, Thermometer, Brain, Heart, FileText,
  Smile, Frown, Meh
} from 'lucide-react';

export const SymptomTracker = () => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const [symptoms, setSymptoms] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Log State
  const [newLog, setNewLog] = useState({
    fatigue: 5,
    nausea: 0,
    pain: 0,
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
    loadSymptoms();
  }, [user]);

  const loadSymptoms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSymptoms(data || []);
    } catch (err) {
      console.error('Error loading symptoms:', err);
      addToast('Error', 'Could not load symptoms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLog = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .insert([{
          user_id: user.id,
          fatigue: newLog.fatigue,
          nausea: newLog.nausea,
          pain: newLog.pain,
          mood: newLog.mood,
          notes: newLog.notes
        }])
        .select();

      if (error) throw error;

      setSymptoms([data[0], ...symptoms]);
      setIsLogging(false);
      setNewLog({ fatigue: 5, nausea: 0, pain: 0, mood: 'Okay', notes: '' });
      addToast('Success', 'Symptom log saved', 'success');
    } catch (err) {
      console.error('Error saving symptom log:', err);
      addToast('Error', 'Could not save symptom log', 'error');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            Symptom Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log your daily symptoms to track your progress and share with your care team.
          </p>
        </div>
        <button
          onClick={() => setIsLogging(!isLogging)}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
            isLogging 
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
          }`}
        >
          {isLogging ? 'Cancel Logging' : <><Plus className="w-4 h-4" /> Log Today's Symptoms</>}
        </button>
      </div>

      {/* Logging Form */}
      {isLogging && (
        <div className="p-6 rounded-3xl glass-card border border-emerald-100 dark:border-emerald-900/30 shadow-pastel animate-fade-in bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
            New Symptom Log
          </h2>

          <div className="space-y-8">
            
            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    Fatigue
                  </label>
                  <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
                    {newLog.fatigue}/10
                  </span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={newLog.fatigue}
                  onChange={(e) => setNewLog({...newLog, fatigue: parseInt(e.target.value)})}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>None</span><span>Severe</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Nausea
                  </label>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
                    {newLog.nausea}/10
                  </span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={newLog.nausea}
                  onChange={(e) => setNewLog({...newLog, nausea: parseInt(e.target.value)})}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>None</span><span>Severe</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    Pain
                  </label>
                  <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-lg">
                    {newLog.pain}/10
                  </span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={newLog.pain}
                  onChange={(e) => setNewLog({...newLog, pain: parseInt(e.target.value)})}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>None</span><span>Severe</span>
                </div>
              </div>

            </div>

            {/* Mood */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Overall Mood</label>
              <div className="flex flex-wrap gap-4">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setNewLog({...newLog, mood: m.label})}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                      newLog.mood === m.label 
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
                <FileText className="w-4 h-4 text-slate-400" />
                Additional Notes
              </label>
              <textarea
                value={newLog.notes}
                onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                placeholder="Any other symptoms or how you're feeling today..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSaveLog}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Save Symptom Log
              </button>
            </div>

          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          Recent Logs
        </h3>

        {symptoms.length > 0 ? (
          <div className="space-y-4">
            {symptoms.map((log) => {
              const moodConfig = moods.find(m => m.label === log.mood) || moods[1];
              const MoodIcon = moodConfig.icon;

              return (
                <div key={log.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2">{formatDate(log.created_at)}</p>
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

                    <div className="flex gap-4 sm:gap-6 pt-2 md:pt-0">
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{log.fatigue}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fatigue</div>
                      </div>
                      <div className="w-px bg-slate-100 dark:bg-slate-700"></div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{log.nausea}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nausea</div>
                      </div>
                      <div className="w-px bg-slate-100 dark:bg-slate-700"></div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{log.pain}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pain</div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Symptoms Logged</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              You haven't logged any symptoms yet. Start tracking to build a history of your wellbeing.
            </p>
            <button
              onClick={() => setIsLogging(true)}
              className="mt-6 px-6 py-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-colors"
            >
              Log First Symptom
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
