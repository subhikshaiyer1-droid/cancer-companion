import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Calendar as CalendarIcon, Plus, MapPin, User, Clock, FileText, CheckCircle } from 'lucide-react';

export const AppointmentManager = () => {
  const { addToast } = useTheme();

  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    doctor: '',
    hospital: '',
    date: '2026-08-15',
    time: '10:00 AM',
    notes: ''
  });

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(() => {
        setAppointments([
          { id: 'app-1', title: 'Oncology Progress Consultation', doctor: 'Dr. Sarah Lin', hospital: 'St. Jude Cancer Center', date: '2026-08-08', time: '10:30 AM', notes: 'Review CBC blood count results and discuss chemo cycle 3.' },
          { id: 'app-2', title: 'Chemotherapy Session #3', doctor: 'Nurse Infusion Team B', hospital: 'Infusion Pavilion Suite 4', date: '2026-08-12', time: '09:00 AM', notes: 'Arrive 30 mins early for hydration pre-medication.' },
          { id: 'app-3', title: 'Clinical Nutritionist Consultation', doctor: 'Elena Rostova, RD', hospital: 'Wellness Center Room 204', date: '2026-08-18', time: '02:00 PM', notes: 'Review high-protein dietary plan.' }
        ]);
      });
  }, []);

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.doctor) return;

    const newAppt = {
      id: 'app-' + Date.now(),
      ...formData
    };

    setAppointments(prev => [...prev, newAppt]);
    setShowAddModal(false);
    addToast('Appointment Scheduled', `Added ${newAppt.title} with ${newAppt.doctor}!`, 'success');

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppt)
    }).catch(() => {});
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-sky-500" /> Appointment Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize doctor visits, chemotherapy sessions, radiation, and lab appointments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Visit
        </button>
      </div>

      {/* Calendar vs List View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'calendar' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Calendar Grid
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel hover:shadow-pastelHover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 font-bold text-xs">
                    📅 {appt.date}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{appt.title}</h3>
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {appt.doctor}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pl-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {appt.hospital}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {appt.time}</span>
                </div>

                {appt.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <FileText className="w-3.5 h-3.5 text-sky-500 inline mr-1" /> Notes: "{appt.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast('Reminder Set', `Alert configured for ${appt.date} at ${appt.time}`, 'info')}
                  className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 transition-colors"
                >
                  Set Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View Simulator */
        <div className="p-6 rounded-3xl glass-card shadow-pastel">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">August 2026 Treatment Calendar</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-slate-400 py-1">{d}</div>
            ))}

            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const hasAppt = appointments.find(a => a.date === dateStr);

              return (
                <div
                  key={i}
                  className={`
                    h-20 p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all
                    ${hasAppt
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 font-bold'
                      : 'bg-white/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400'
                    }
                  `}
                >
                  <span className="text-[11px] text-slate-500">{dayNum}</span>
                  {hasAppt && (
                    <div className="p-1 rounded-lg bg-sky-600 text-white text-[9px] truncate">
                      {hasAppt.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Schedule Appointment
            </h2>
            <p className="text-xs text-slate-500 mb-4">Add appointment details and preparation notes</p>

            <form onSubmit={handleSchedule} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Appointment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oncology Consultation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Doctor / Nurse Specialist</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Lin"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hospital / Clinic Center</label>
                <input
                  type="text"
                  placeholder="e.g. St. Jude Cancer Center"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Preparation Notes</label>
                <textarea
                  rows="2"
                  placeholder="Bring latest CBC blood report, fast for 4 hours..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-semibold shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
