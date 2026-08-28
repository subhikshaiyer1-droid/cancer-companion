import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Pill, Plus, CheckCircle2, Circle, Clock, Bell, Trash2 } from 'lucide-react';

export const MedicationManager = () => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const [medications, setMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    time: '08:00 AM',
    frequency: 'Once Daily',
    instructions: ''
  });

  useEffect(() => {
    if (!user) return;
    loadMedications();
  }, [user]);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (err) {
      console.error('Error loading medications:', err);
      addToast('Error', 'Could not load medications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaken = async (id, currentState) => {
    const nextState = !currentState;
    
    try {
      const { error } = await supabase
        .from('medications')
        .update({ taken_today: nextState })
        .eq('id', id);

      if (error) throw error;

      setMedications(prev => prev.map(m => {
        if (m.id === id) {
          if (nextState) {
            addToast('Medication Recorded', `Marked ${m.name} as taken today!`, 'success');
          }
          return { ...m, taken_today: nextState };
        }
        return m;
      }));
    } catch (err) {
      console.error('Error updating medication:', err);
      addToast('Error', 'Could not update medication status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMedications(prev => prev.filter(m => m.id !== id));
      addToast('Deleted', 'Medication removed', 'success');
    } catch (err) {
      console.error('Error deleting medication:', err);
      addToast('Error', 'Could not delete medication', 'error');
    }
  };

  const handleAddMed = async (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;

    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          user_id: user.id,
          name: newMed.name,
          dosage: newMed.dosage,
          time: newMed.time,
          frequency: newMed.frequency,
          instructions: newMed.instructions,
          taken_today: false
        }])
        .select();

      if (error) throw error;

      setMedications([data[0], ...medications]);
      setShowAddModal(false);
      setNewMed({ name: '', dosage: '', time: '08:00 AM', frequency: 'Once Daily', instructions: '' });
      addToast('Medication Added', `${data[0].name} added to your daily schedule!`, 'success');
    } catch (err) {
      console.error('Error adding medication:', err);
      addToast('Error', 'Could not add medication', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const takenCount = medications.filter(m => m.taken_today).length;
  const totalCount = medications.length;
  const adherenceRate = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
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
            {takenCount} of {totalCount} Medicines Taken
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${adherenceRate}%` }}
          />
        </div>
      </div>

      {/* Medications List */}
      {medications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`
                p-5 rounded-3xl border transition-all glass-card flex flex-col justify-between
                ${med.taken_today
                  ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-300'
                }
              `}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${med.taken_today ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600 dark:bg-purple-950/60'}`}>
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${med.taken_today ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {med.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-semibold">{med.dosage} • {med.frequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-500" /> {med.time}
                    </span>
                    <button onClick={() => handleDelete(med.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                  onClick={() => toggleTaken(med.id, med.taken_today)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2
                    ${med.taken_today
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
                    }
                  `}
                >
                  {med.taken_today ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  {med.taken_today ? 'Taken' : 'Mark as Taken'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Medications Tracked</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't added any medications yet. Start adding your prescriptions to keep track of your doses.
          </p>
        </div>
      )}

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
