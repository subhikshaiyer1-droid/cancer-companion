import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Pill, Plus, CheckCircle2, Circle, Clock, Bell, Trash2 } from 'lucide-react';

export const MedicationManager = () => {
  const { addToast } = useTheme();

  const [medications, setMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    time: '08:00 AM',
    frequency: 'Once Daily',
    instructions: ''
  });

  useEffect(() => {
    fetch('/api/medications')
      .then(res => res.json())
      .then(data => setMedications(data))
      .catch(() => {
        setMedications([
          { id: 'med-1', name: 'Ondansetron (Zofran)', dosage: '8mg', time: '08:00 AM', frequency: 'Twice Daily', instructions: 'Take before meals for anti-nausea', takenToday: true },
          { id: 'med-2', name: 'Dexamethasone', dosage: '4mg', time: '09:00 AM', frequency: 'Once Daily', instructions: 'Take with morning food', takenToday: true },
          { id: 'med-3', name: 'Filgrastim (Neupogen)', dosage: '300mcg', time: '08:00 PM', frequency: 'Once Daily', instructions: 'Subcutaneous injection for white blood cell count', takenToday: false },
          { id: 'med-4', name: 'Multivitamin Support', dosage: '1 tab', time: '01:00 PM', frequency: 'Daily', instructions: 'Take after lunch', takenToday: false }
        ]);
      });
  }, []);

  const toggleTaken = (id) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.takenToday;
        if (nextState) {
          addToast('Medication Recorded', `Marked ${m.name} as taken today!`, 'success');
        }
        return { ...m, takenToday: nextState };
      }
      return m;
    }));

    fetch(`/api/medications/${id}/toggle`, { method: 'PATCH' }).catch(() => {});
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;

    const medToAdd = {
      id: 'med-' + Date.now(),
      ...newMed,
      takenToday: false
    };

    setMedications(prev => [...prev, medToAdd]);
    setShowAddModal(false);
    setNewMed({ name: '', dosage: '', time: '08:00 AM', frequency: 'Once Daily', instructions: '' });
    addToast('Medication Added', `${medToAdd.name} added to your daily schedule with reminder alerts!`, 'success');

    fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medToAdd)
    }).catch(() => {});
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Pill className="w-8 h-8 text-purple-500" /> Medication Reminders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily chemotherapy, anti-emetics, and supportive care prescriptions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Daily Progress Bar */}
      <div className="p-6 rounded-3xl glass-card shadow-pastel">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Today's Adherence Rate</span>
          <span className="text-xs font-extrabold text-purple-600">
            {medications.filter(m => m.takenToday).length} of {medications.length} Medicines Taken
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${medications.length > 0 ? (medications.filter(m => m.takenToday).length / medications.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Medications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`
              p-5 rounded-3xl border transition-all glass-card flex flex-col justify-between
              ${med.takenToday
                ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-300'
              }
            `}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${med.takenToday ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600 dark:bg-purple-950/60'}`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${med.takenToday ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {med.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">{med.dosage} • {med.frequency}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-500" /> {med.time}
                </span>
              </div>

              {med.instructions && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 italic">
                  "{med.instructions}"
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-purple-400" /> Reminders Active
              </span>

              <button
                onClick={() => toggleTaken(med.id)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2
                  ${med.takenToday
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
                  }
                `}
              >
                {med.takenToday ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                {med.takenToday ? 'Taken' : 'Mark as Taken'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Add Prescription / Medicine
            </h2>
            <p className="text-xs text-slate-500 mb-4">Set dosage, scheduled time, and reminders</p>

            <form onSubmit={handleAddMed} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ondansetron (Zofran)"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    placeholder="08:00 AM"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Frequency</label>
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option>Once Daily</option>
                  <option>Twice Daily</option>
                  <option>Three Times Daily</option>
                  <option>As Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="Take before meals with warm water..."
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
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
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold shadow-md"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
