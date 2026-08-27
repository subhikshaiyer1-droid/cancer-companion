import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Activity,
  Plus,
  Calendar,
  TrendingUp,
  Smile,
  Thermometer,
  Weight as WeightIcon,
  Moon,
  Utensils,

} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const SymptomTracker = () => {
  const { addToast } = useTheme();

  const [logs, setLogs] = useState([]);
  const [activeView, setActiveView] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'

  const [formData, setFormData] = useState({
    pain: 3,
    fatigue: 4,
    nausea: 2,
    appetite: 'Moderate',
    sleep: '7.5 hrs',
    mood: 'Calm',
    weight: '64.5',
    temperature: '36.6',
    notes: ''
  });

  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    fetch('/api/symptoms')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(() => {
        setLogs([
          { id: 'sym-1', date: '08/01', pain: 4, fatigue: 6, nausea: 3, weight: 64.5, temp: 36.8 },
          { id: 'sym-2', date: '08/02', pain: 5, fatigue: 7, nausea: 5, weight: 64.2, temp: 37.1 },
          { id: 'sym-3', date: '08/03', pain: 3, fatigue: 5, nausea: 2, weight: 64.3, temp: 36.6 },
          { id: 'sym-4', date: '08/04', pain: 2, fatigue: 4, nausea: 1, weight: 64.6, temp: 36.7 },
          { id: 'sym-5', date: '08/05', pain: 3, fatigue: 4, nausea: 2, weight: 64.5, temp: 36.6 }
        ]);
      });
  }, []);

  const handleSaveLog = (e) => {
    e.preventDefault();
    const newLog = {
      id: 'sym-' + Date.now(),
      date: new Date().toLocaleDateString([], { month: '2-digit', day: '2-digit' }),
      ...formData,
      pain: Number(formData.pain),
      fatigue: Number(formData.fatigue),
      nausea: Number(formData.nausea)
    };

    setLogs(prev => [newLog, ...prev]);
    setShowLogModal(false);
    addToast('Symptom Logged', 'Today’s health metrics recorded successfully.', 'success');

    fetch('/api/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(() => {});
  };

  const chartData = [...logs].reverse().map(l => ({
    date: l.date,
    Pain: l.pain,
    Fatigue: l.fatigue,
    Nausea: l.nausea,
    Weight: Number(l.weight) || 64
  }));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Quick Log Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-8 h-8 text-sky-500" /> Symptom Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor pain, fatigue, nausea, appetite, sleep, and vital trends
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log Today's Symptoms
        </button>
      </div>


      {/* View Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 w-fit">
        {['weekly', 'daily', 'monthly'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeView === view
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {view} {view === 'weekly' ? 'Charts' : view === 'daily' ? 'Logs' : 'Trends'}
          </button>
        ))}
      </div>

      {/* Interactive Recharts Visualization */}
      {activeView !== 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pain & Fatigue Area Chart */}
          <div className="p-6 rounded-3xl glass-card shadow-pastel">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Pain & Fatigue Intensity (1-10)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Multi-metric symptom progression curve</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: '#0F172A', color: '#FFF' }} />
                  <Area type="monotone" dataKey="Pain" stroke="#EF4444" fillOpacity={1} fill="url(#colorPain)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Fatigue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorFatigue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nausea & Weight Bar Chart */}
          <div className="p-6 rounded-3xl glass-card shadow-pastel">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Nausea Level & Weight Monitoring
            </h3>
            <p className="text-xs text-slate-500 mb-4">Tracking digestive comfort and body weight</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: '#0F172A', color: '#FFF' }} />
                  <Bar dataKey="Nausea" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Daily Symptom Logs Table / Cards */}
      <div className="rounded-3xl glass-card p-6 shadow-pastel">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
          Daily Symptom Logs History
        </h3>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs">
                  {log.date}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>Mood: <strong className="text-indigo-600">{log.mood}</strong></span>
                    <span>•</span>
                    <span>Appetite: <strong>{log.appetite}</strong></span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Sleep: {log.sleep} | Temp: {log.temperature || log.temp}°C | Weight: {log.weight} kg</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold">
                  Pain {log.pain}/10
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                  Fatigue {log.fatigue}/10
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 text-xs font-semibold">
                  Nausea {log.nausea}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symptom Entry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Log Today's Health Metrics
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Track how you are feeling to share with your oncology team
            </p>

            <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
              {/* Pain Level Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <label className="text-slate-700 dark:text-slate-300">Pain Level (1 - 10)</label>
                  <span className="text-rose-500 font-bold">{formData.pain} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.pain}
                  onChange={(e) => setFormData({ ...formData, pain: e.target.value })}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Fatigue Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <label className="text-slate-700 dark:text-slate-300">Fatigue Level (1 - 10)</label>
                  <span className="text-purple-500 font-bold">{formData.fatigue} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.fatigue}
                  onChange={(e) => setFormData({ ...formData, fatigue: e.target.value })}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Nausea Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <label className="text-slate-700 dark:text-slate-300">Nausea Level (1 - 10)</label>
                  <span className="text-sky-500 font-bold">{formData.nausea} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.nausea}
                  onChange={(e) => setFormData({ ...formData, nausea: e.target.value })}
                  className="w-full accent-sky-500"
                />
              </div>

              {/* Grid Inputs: Mood, Appetite, Weight, Temp */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mood</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option>Calm</option>
                    <option>Hopeful</option>
                    <option>Peaceful</option>
                    <option>Anxious</option>
                    <option>Tired</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Appetite</label>
                  <select
                    value={formData.appetite}
                    onChange={(e) => setFormData({ ...formData, appetite: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option>Good</option>
                    <option>Moderate</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-semibold shadow-md"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
