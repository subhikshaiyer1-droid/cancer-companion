import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Pill,
  Calendar,
  Activity,
  Droplet,
  Smile,
  Bot,
  CheckCircle2,
  Circle,
  Plus,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [latestSymptom, setLatestSymptom] = useState(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [moodToday, setMoodToday] = useState('');

  useEffect(() => {
    // Load medications
    fetch('/api/medications')
      .then((res) => {
        if (!res.ok) throw new Error('No medications');
        return res.json();
      })
      .then((data) => setMedications(data))
      .catch(() => setMedications([]));

    // Load appointments
    fetch('/api/appointments')
      .then((res) => {
        if (!res.ok) throw new Error('No appointments');
        return res.json();
      })
      .then((data) => setAppointments(data))
      .catch(() => setAppointments([]));

    // Load symptoms
    fetch('/api/symptoms')
      .then((res) => {
        if (!res.ok) throw new Error('No symptoms');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestSymptom(data[0]);
          setMoodToday(data[0].mood || '');
        } else {
          setLatestSymptom(null);
        }
      })
      .catch(() => setLatestSymptom([]));

    // Start hydration at zero for new users
    setWaterGlasses(0);
  }, [user]);

  const toggleMedication = (id) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const nextState = !med.takenToday;

          if (nextState) {
            addToast(
              'Medication Taken',
              `${med.name} marked as taken.`,
              'success'
            );
          }

          return {
            ...med,
            takenToday: nextState
          };
        }

        return med;
      })
    );
  };

  const addWater = () => {
    if (waterGlasses < 8) {
      const nextCount = waterGlasses + 1;

      setWaterGlasses(nextCount);

      addToast(
        'Hydration Logged',
        `Glass ${nextCount}/8 added.`,
        'success'
      );
    }
  };

  const healthScore = () => {
    let score = 0;

    if (waterGlasses > 0) {
      score += Math.round((waterGlasses / 8) * 30);
    }

    if (medications.length > 0) {
      const taken = medications.filter(
        (med) => med.takenToday
      ).length;

      score += Math.round(
        (taken / medications.length) * 40
      );
    }

    if (latestSymptom) {
      score += 30;
    }

    return score;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">

      {/* Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-200/50 dark:border-sky-800/30 glass-card">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              YOUR PERSONAL HEALTH SPACE
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Welcome, {user?.name || 'User'} 👋
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl leading-relaxed">
              Start tracking your health journey. Add your symptoms,
              medications, appointments and daily wellness progress.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold text-xs sm:text-sm hover:bg-sky-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Bot className="w-4 h-4" />
              Ask AI Companion
            </button>

            <button
              onClick={() => setActiveTab('symptoms')}
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Symptoms
            </button>

          </div>
        </div>
      </div>


      {/* Main Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Health Score */}
        <div className="p-6 rounded-3xl glass-card flex flex-col items-center justify-center text-center shadow-pastel">

          <div className="w-36 h-36 rounded-full border-8 border-sky-500 flex items-center justify-center">
            <div>
              <div className="text-4xl font-bold text-slate-800 dark:text-white">
                {healthScore()}
              </div>

              <div className="text-xs text-slate-500">
                HEALTH SCORE
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-5">
            Daily Health Score
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Your score will improve as you track your health activities.
          </p>

          <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around">

            <div>
              <span className="text-xs text-slate-400 block">
                Today's Mood
              </span>

              <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1 mt-1">
                <Smile className="w-4 h-4" />
                {moodToday || 'Not logged'}
              </span>
            </div>

            <div className="w-px h-8 bg-slate-200" />

            <div>
              <span className="text-xs text-slate-400 block">
                Pain Rating
              </span>

              <span className="text-sm font-semibold text-emerald-600 mt-1 block">
                {latestSymptom
                  ? `${latestSymptom.pain}/10`
                  : 'Not logged'}
              </span>
            </div>

          </div>
        </div>


        {/* Medicines */}
        <div className="p-6 rounded-3xl glass-card md:col-span-2 shadow-pastel">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                <Pill className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold">
                  Today's Medicines
                </h3>

                <p className="text-xs text-slate-500">
                  Track your medication schedule
                </p>
              </div>

            </div>

            <button
              onClick={() => setActiveTab('medications')}
              className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
            >
              Manage
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

          </div>


          {medications.length > 0 ? (

            <div className="space-y-3">

              {medications.slice(0, 3).map((med) => (

                <div
                  key={med.id}
                  onClick={() => toggleMedication(med.id)}
                  className="p-3.5 rounded-2xl border border-slate-200 cursor-pointer flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <button className="text-emerald-500">
                      {med.takenToday ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div>
                      <h4 className="text-sm font-semibold">
                        {med.name}
                      </h4>

                      <p className="text-xs text-slate-500">
                        {med.dosage} • {med.time}
                      </p>
                    </div>

                  </div>

                  <span className="text-xs font-semibold">
                    {med.takenToday ? 'Taken' : 'Due'}
                  </span>

                </div>

              ))}

            </div>

          ) : (

            <div className="py-10 text-center">

              <Pill className="w-10 h-10 mx-auto text-slate-300 mb-3" />

              <h4 className="font-semibold text-slate-600">
                No medicines added yet
              </h4>

              <p className="text-xs text-slate-400 mt-1">
                Add your medications to start tracking them.
              </p>

              <button
                onClick={() => setActiveTab('medications')}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-semibold"
              >
                Add Medication
              </button>

            </div>

          )}

        </div>

      </div>


      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


        {/* Appointment */}
        <div className="p-6 rounded-3xl glass-card shadow-pastel">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                <Calendar className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold">
                Next Appointment
              </h3>

            </div>

            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-sky-600 font-semibold hover:underline"
            >
              View All
            </button>

          </div>


          {appointments.length > 0 ? (

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">

              <h4 className="text-sm font-bold">
                {appointments[0].title}
              </h4>

              <p className="text-xs text-slate-600 mt-1">
                {appointments[0].doctor}
              </p>

              <p className="text-xs text-slate-500">
                📅 {appointments[0].date}
              </p>

            </div>

          ) : (

            <div className="py-8 text-center">

              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />

              <p className="text-sm font-semibold text-slate-500">
                No appointments yet
              </p>

              <button
                onClick={() => setActiveTab('appointments')}
                className="mt-3 text-xs text-sky-600 font-semibold"
              >
                + Add Appointment
              </button>

            </div>

          )}

        </div>


        {/* Hydration */}
        <div className="p-6 rounded-3xl glass-card shadow-pastel flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-2">

                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Droplet className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold">
                  Hydration Progress
                </h3>

              </div>

              <span className="text-xs font-bold text-blue-600">
                {waterGlasses} / 8
              </span>

            </div>


            <div className="grid grid-cols-4 gap-2 mb-4">

              {Array.from({ length: 8 }).map((_, i) => (

                <div
                  key={i}
                  className={`h-8 rounded-xl flex items-center justify-center ${i < waterGlasses
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-300'
                    }`}
                >
                  <Droplet className="w-4 h-4 fill-current" />
                </div>

              ))}

            </div>

          </div>


          <button
            onClick={addWater}
            className="w-full py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Water
          </button>

        </div>


        {/* Symptoms */}
        <div className="p-6 rounded-3xl glass-card shadow-pastel">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold">
                Latest Symptoms
              </h3>

            </div>

            <button
              onClick={() => setActiveTab('symptoms')}
              className="text-xs text-sky-600 font-semibold hover:underline"
            >
              Log Now
            </button>

          </div>


          {latestSymptom ? (

            <div className="space-y-2 text-xs">

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span>Fatigue</span>
                <span className="font-semibold">
                  {latestSymptom.fatigue}/10
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span>Nausea</span>
                <span className="font-semibold">
                  {latestSymptom.nausea}/10
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span>Pain</span>
                <span className="font-semibold">
                  {latestSymptom.pain}/10
                </span>
              </div>

            </div>

          ) : (

            <div className="py-8 text-center">

              <Activity className="w-10 h-10 mx-auto text-slate-300 mb-3" />

              <p className="text-sm font-semibold text-slate-500">
                No symptoms logged yet
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Start tracking how you feel today.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};