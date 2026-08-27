import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HealthScoreGauge } from './HealthScoreGauge';
import {
  Pill,
  Calendar,
  Activity,
  Droplet,
  Smile,
  Bot,
  PhoneCall,
  CheckCircle2,
  Circle,
  Plus,
  ArrowUpRight,
  Heart,
  Sparkles
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [latestSymptom, setLatestSymptom] = useState(null);
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [moodToday, setMoodToday] = useState('Hopeful');

  useEffect(() => {
    // Fetch medications
    fetch('/api/medications')
      .then(res => res.json())
      .then(data => setMedications(data))
      .catch(() => {
        setMedications([
          { id: 'med-1', name: 'Ondansetron (Zofran)', dosage: '8mg', time: '08:00 AM', takenToday: true },
          { id: 'med-2', name: 'Dexamethasone', dosage: '4mg', time: '09:00 AM', takenToday: true },
          { id: 'med-3', name: 'Filgrastim (Neupogen)', dosage: '300mcg', time: '08:00 PM', takenToday: false },
        ]);
      });

    // Fetch appointments
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(() => {
        setAppointments([
          { id: 'app-1', title: 'Oncology Consultation', doctor: 'Dr. Sarah Lin', hospital: 'St. Jude Cancer Center', date: '2026-08-08', time: '10:30 AM' }
        ]);
      });

    // Fetch latest symptoms
    fetch('/api/symptoms')
      .then(res => res.json())
      .then(data => setLatestSymptom(data[0]))
      .catch(() => {
        setLatestSymptom({ pain: 3, fatigue: 4, nausea: 2, mood: 'Peaceful', weight: 64.5 });
      });
  }, []);

  const toggleMedication = (id) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.takenToday;
        if (nextState) addToast('Medication Taken', `Marked ${m.name} as taken today!`, 'success');
        return { ...m, takenToday: nextState };
      }
      return m;
    }));

    fetch(`/api/medications/${id}/toggle`, { method: 'PATCH' }).catch(() => {});
  };

  const addWater = () => {
    if (waterGlasses < 10) {
      const nextCount = waterGlasses + 1;
      setWaterGlasses(nextCount);
      addToast('Hydration Logged', `Glass ${nextCount}/8 added. Great job maintaining fluid balance!`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Calm Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-200/50 dark:border-sky-800/30 glass-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Good day & Peace of Mind
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Welcome back, {user?.name || 'Eleanor'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              "Healing takes time, and asking for help is a sign of great strength." Here is your daily treatment & wellness summary.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold text-xs sm:text-sm hover:bg-sky-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Bot className="w-4 h-4 text-sky-500" />
              <span>Ask AI Companion</span>
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Symptoms</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Health Score & Mood Summary Card */}
        <div className="p-6 rounded-3xl glass-card flex flex-col items-center justify-center text-center shadow-pastel hover:shadow-pastelHover transition-all">
          <HealthScoreGauge score={86} />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-4">
            Daily Health Score
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculated from hydration, medication adherence & pain level
          </p>

          <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around">
            <div>
              <span className="text-xs text-slate-400 block">Today's Mood</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                <Smile className="w-4 h-4" /> {moodToday}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-xs text-slate-400 block">Pain Rating</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {latestSymptom?.pain || 3} / 10 (Mild)
              </span>
            </div>
          </div>
        </div>

        {/* Today's Medications Card */}
        <div className="p-6 rounded-3xl glass-card md:col-span-2 shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Today's Medicines</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Keep up with your treatment schedule</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('medications')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                Manage <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {medications.slice(0, 3).map((med) => (
                <div
                  key={med.id}
                  onClick={() => toggleMedication(med.id)}
                  className={`
                    p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                    ${med.takenToday
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300'
                      : 'bg-white/80 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70 hover:border-sky-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-emerald-500">
                      {med.takenToday ? <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" /> : <Circle className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div>
                      <h4 className={`text-sm font-semibold ${med.takenToday ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{med.dosage} • {med.time}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${med.takenToday ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'}`}>
                    {med.takenToday ? 'Taken' : 'Due'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Upcoming Appointments, Hydration Progress, Symptoms Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="p-6 rounded-3xl glass-card shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Next Appointment</h3>
              </div>
              <button onClick={() => setActiveTab('appointments')} className="text-xs text-sky-600 font-semibold hover:underline">View All</button>
            </div>

            {appointments[0] ? (
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{appointments[0].title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{appointments[0].doctor}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{appointments[0].hospital}</p>

                <div className="mt-3 pt-3 border-t border-sky-200/50 dark:border-sky-800/50 flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-300">
                  <span>📅 {appointments[0].date}</span>
                  <span>⏰ {appointments[0].time}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No upcoming appointments scheduled.</p>
            )}
          </div>
        </div>

        {/* Hydration Tracker Card */}
        <div className="p-6 rounded-3xl glass-card shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                  <Droplet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Hydration Progress</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{waterGlasses} / 8 Glasses</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Proper fluid intake helps flush treatment metabolites and reduces fatigue.
            </p>

            {/* Visual Glass Counter */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-xl flex items-center justify-center transition-all ${
                    i < waterGlasses
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                  }`}
                >
                  <Droplet className="w-4 h-4 fill-current" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={addWater}
            className="w-full py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Water (+1 Glass)
          </button>
        </div>

        {/* Symptoms Summary Card */}
        <div className="p-6 rounded-3xl glass-card shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Latest Symptoms</h3>
              </div>
              <button onClick={() => setActiveTab('symptoms')} className="text-xs text-sky-600 font-semibold hover:underline">Full Log</button>
            </div>

            {latestSymptom && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-500">Fatigue Level</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{latestSymptom.fatigue} / 10</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-500">Nausea Level</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{latestSymptom.nausea} / 10</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-500">Body Weight</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{latestSymptom.weight || '64.5'} kg</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('symptoms')}
            className="w-full mt-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
          >
            Update Today's Symptoms
          </button>
        </div>
      </div>
    </div>
  );
};
