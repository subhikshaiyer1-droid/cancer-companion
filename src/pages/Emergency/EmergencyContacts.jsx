import React, { useState, useEffect } from 'react';

import { useTheme } from '../../context/ThemeContext';
import { PhoneCall, Plus, UserCheck, ShieldAlert, Building, Mail, Phone, MessageSquare } from 'lucide-react';

export const EmergencyContacts = () => {
  const { addToast } = useTheme();

  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newContact, setNewContact] = useState({
    name: '',
    role: 'Primary Oncologist',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(() => {
        setContacts([
          { id: 'con-1', name: 'Dr. Sarah Lin', role: 'Primary Oncologist', phone: '+1 (555) 019-2831', hospital: 'St. Jude Cancer Center', email: 'dr.lin@stjude-oncology.org' },
          { id: 'con-2', name: 'Mark Vance', role: 'Primary Caregiver (Spouse)', phone: '+1 (555) 883-9201', email: 'mark.vance@example.com' },
          { id: 'con-3', name: 'Oncology 24/7 Helpline', role: 'Triage Nurse Helpline', phone: '+1 (800) 555-CARE', hospital: 'St. Jude Emergency Desk' },
          { id: 'con-4', name: 'St. Jude Hospital ER Desk', role: 'Hospital Emergency', phone: '911', address: '742 Evergreen Terrace, Medical District' }
        ]);
      });
  }, []);

  const handleCall = (name, phone) => {
    addToast('Initiating Call', `Dialing ${name} (${phone})...`, 'warning');
    window.location.href = `tel:${phone}`;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    const contactToAdd = {
      id: 'con-' + Date.now(),
      ...newContact
    };

    setContacts(prev => [...prev, contactToAdd]);
    setShowAddModal(false);
    addToast('Contact Saved', `${contactToAdd.name} added to 1-tap emergency contacts.`, 'success');

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactToAdd)
    }).catch(() => {});
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PhoneCall className="w-8 h-8 text-rose-500" /> Emergency & Care Contacts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            One-tap direct dial for oncologists, caregivers, 24/7 triage, and hospitals
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Emergency Contact
        </button>
      </div>

      {/* Triage Banner */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 flex items-center gap-3 text-rose-800 dark:text-rose-200">
        <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong>FEVER & EMERGENCY ALERT:</strong> If your temperature exceeds 38.0°C (100.4°F) during chemotherapy, contact your oncologist or emergency department immediately.
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                  {contact.role}
                </span>
                <Phone className="w-4 h-4 text-slate-400" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{contact.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{contact.hospital || contact.address || 'Personal Contact'}</p>
              {contact.email && <p className="text-xs text-slate-400 mt-0.5">{contact.email}</p>}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <button
                onClick={() => handleCall(contact.name, contact.phone)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" /> 1-Tap Call ({contact.phone})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Add Emergency Contact
            </h2>
            <p className="text-xs text-slate-500 mb-4">Save doctor, caregiver, or hospital details</p>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name / Hospital</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Lin"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Role / Relationship</label>
                <input
                  type="text"
                  required
                  placeholder="Primary Oncologist / Caregiver"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
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
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
