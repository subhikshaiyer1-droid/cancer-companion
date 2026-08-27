import express from 'express';

const router = express.Router();

// Mock initial data stores with rich initial data for demonstration
let symptomsStore = [
  { id: 'sym-1', date: '2026-08-01', pain: 4, fatigue: 6, nausea: 3, appetite: 'Moderate', sleep: '6 hrs', mood: 'Calm', weight: 64.5, temperature: 36.8 },
  { id: 'sym-2', date: '2026-08-02', pain: 5, fatigue: 7, nausea: 5, appetite: 'Low', sleep: '5 hrs', mood: 'Anxious', weight: 64.2, temperature: 37.1 },
  { id: 'sym-3', date: '2026-08-03', pain: 3, fatigue: 5, nausea: 2, appetite: 'Good', sleep: '7 hrs', mood: 'Hopeful', weight: 64.3, temperature: 36.6 },
  { id: 'sym-4', date: '2026-08-04', pain: 2, fatigue: 4, nausea: 1, appetite: 'Good', sleep: '8 hrs', mood: 'Grateful', weight: 64.6, temperature: 36.7 },
  { id: 'sym-5', date: '2026-08-05', pain: 3, fatigue: 4, nausea: 2, appetite: 'Moderate', sleep: '7.5 hrs', mood: 'Peaceful', weight: 64.5, temperature: 36.6 }
];

let medicationsStore = [
  { id: 'med-1', name: 'Ondansetron (Zofran)', dosage: '8mg', time: '08:00 AM', frequency: 'Twice Daily', instructions: 'Take with water before meals for anti-nausea', takenToday: true },
  { id: 'med-2', name: 'Dexamethasone', dosage: '4mg', time: '09:00 AM', frequency: 'Once Daily', instructions: 'Take with morning breakfast', takenToday: true },
  { id: 'med-3', name: 'Filgrastim (Neupogen)', dosage: '300mcg', time: '08:00 PM', frequency: 'Once Daily', instructions: 'Subcutaneous injection for white blood cells', takenToday: false },
  { id: 'med-4', name: 'Multivitamin & Iron Support', dosage: '1 tablet', time: '01:00 PM', frequency: 'Daily', instructions: 'Nutritional supplement after lunch', takenToday: false }
];

let appointmentsStore = [
  { id: 'app-1', title: 'Oncology Consultation', doctor: 'Dr. Sarah Lin', hospital: 'St. Jude Cancer Center', date: '2026-08-08', time: '10:30 AM', type: 'Checkup', notes: 'Review blood work CBC and discuss chemotherapy cycle #3 progress.' },
  { id: 'app-2', title: 'Chemotherapy Session #3', doctor: 'Nurse Team A', hospital: 'St. Jude Infusion Suite B', date: '2026-08-12', time: '09:00 AM', type: 'Treatment', notes: 'Hydration premedication starts at 8:30 AM.' },
  { id: 'app-3', title: 'Nutritionist Follow-up', doctor: 'Elena Rostova, RD', hospital: 'Wellness Pavilion', date: '2026-08-18', time: '02:00 PM', type: 'Nutrition', notes: 'Evaluate protein intake and hydration goals.' }
];

let timelineStore = [
  { id: 'time-1', phase: 'Diagnosis', title: 'Biopsy Confirmation', date: '2026-05-10', description: 'Confirmed Stage II diagnosis with ER+/PR+ markers.', status: 'completed' },
  { id: 'time-2', phase: 'Surgery', title: 'Lumpectomy Procedure', date: '2026-06-04', description: 'Successful removal of primary tumor site with clear margins.', status: 'completed' },
  { id: 'time-3', phase: 'Chemotherapy', title: 'Cycle 1 & 2 Infusions', date: '2026-07-02', description: 'Completed first two adjuvant AC chemotherapy cycles.', status: 'completed' },
  { id: 'time-4', phase: 'Chemotherapy', title: 'Cycle 3 Infusion', date: '2026-08-12', description: 'Upcoming chemo infusion session.', status: 'upcoming' },
  { id: 'time-5', phase: 'Radiation', title: 'Targeted Radiation Therapy', date: '2026-09-15', description: 'Scheduled 5-week course of external beam radiation.', status: 'planned' },
  { id: 'time-6', phase: 'Recovery', title: 'Survivorship Milestone', date: '2026-11-01', description: 'Transition to endocrine maintenance therapy and wellness rehabilitation.', status: 'planned' }
];

let reportsStore = [
  { id: 'rep-1', title: 'Complete Blood Count (CBC) Panel', category: 'Blood Work', date: '2026-07-28', doctor: 'Dr. Sarah Lin', fileType: 'pdf', fileSize: '1.2 MB', notes: 'WBC within expected range post-cycle 2.' },
  { id: 'rep-2', title: 'Chest & Torso PET/CT Scan', category: 'Scans & Imaging', date: '2026-06-20', doctor: 'Dr. Marcus Vance', fileType: 'image', fileSize: '4.8 MB', notes: 'No evidence of distant metastasis.' },
  { id: 'rep-3', title: 'Surgical Pathology Findings', category: 'Pathology', date: '2026-06-08', doctor: 'Dr. Sarah Lin', fileType: 'pdf', fileSize: '2.1 MB', notes: 'Clear resection margins achieved.' }
];

let contactsStore = [
  { id: 'con-1', name: 'Dr. Sarah Lin', role: 'Primary Oncologist', phone: '+1 (555) 019-2831', hospital: 'St. Jude Cancer Center', email: 'dr.lin@stjude-oncology.org' },
  { id: 'con-2', name: 'Mark Vance', role: 'Primary Caregiver & Partner', phone: '+1 (555) 883-9201', relation: 'Spouse', email: 'mark.vance@example.com' },
  { id: 'con-3', name: 'Oncology 24/7 Helpline', role: 'Emergency Triage', phone: '+1 (800) 555-CARE', hospital: 'St. Jude Emergency Center', email: 'triage@stjude.org' },
  { id: 'con-4', name: 'St. Jude Hospital ER', role: 'Hospital Emergency', phone: '911', address: '742 Evergreen Terrace, Medical District', email: 'er@stjude.org' }
];

let communityStore = [
  { id: 'com-1', author: 'WarriorGrace22', date: '2026-08-04', topic: 'Chemotherapy Tips', content: 'Warm ginger tea and small saltine crackers before getting out of bed helped so much with morning chemo nausea today. Sending strength to everyone fighting!', hugs: 24, replies: 6, flagged: false },
  { id: 'com-2', author: 'HopefulJourney', date: '2026-08-03', topic: 'Emotional Wellness', content: 'Finished my last radiation session today! Ringing the bell felt surreal. To anyone starting out: take it one single day at a time, you are stronger than you know.', hugs: 48, replies: 12, flagged: false },
  { id: 'com-3', author: 'CaregiverDan', date: '2026-08-02', topic: 'Caregiver Support', content: 'As a caregiver, how do you handle your own emotional burnout while staying positive for your partner?', hugs: 15, replies: 8, flagged: false }
];

// --- ROUTES ---

// Symptoms
router.get('/symptoms', (req, res) => res.json(symptomsStore));
router.post('/symptoms', (req, res) => {
  const newLog = { id: 'sym-' + Date.now(), ...req.body, date: req.body.date || new Date().toISOString().split('T')[0] };
  symptomsStore.unshift(newLog);
  res.status(201).json(newLog);
});

// Medications
router.get('/medications', (req, res) => res.json(medicationsStore));
router.post('/medications', (req, res) => {
  const newMed = { id: 'med-' + Date.now(), takenToday: false, ...req.body };
  medicationsStore.push(newMed);
  res.status(201).json(newMed);
});
router.patch('/medications/:id/toggle', (req, res) => {
  const med = medicationsStore.find(m => m.id === req.params.id);
  if (med) {
    med.takenToday = !med.takenToday;
    res.json(med);
  } else res.status(404).json({ error: 'Medication not found' });
});

// Appointments
router.get('/appointments', (req, res) => res.json(appointmentsStore));
router.post('/appointments', (req, res) => {
  const appt = { id: 'app-' + Date.now(), ...req.body };
  appointmentsStore.push(appt);
  res.status(201).json(appt);
});

// Timeline
router.get('/timeline', (req, res) => res.json(timelineStore));

// Reports
router.get('/reports', (req, res) => res.json(reportsStore));
router.post('/reports', (req, res) => {
  const report = { id: 'rep-' + Date.now(), date: new Date().toISOString().split('T')[0], fileSize: '1.5 MB', ...req.body };
  reportsStore.unshift(report);
  res.status(201).json(report);
});

// Emergency Contacts
router.get('/contacts', (req, res) => res.json(contactsStore));
router.post('/contacts', (req, res) => {
  const contact = { id: 'con-' + Date.now(), ...req.body };
  contactsStore.push(contact);
  res.status(201).json(contact);
});

// Community
router.get('/community', (req, res) => res.json(communityStore.filter(p => !p.flagged)));
router.post('/community', (req, res) => {
  const post = { id: 'com-' + Date.now(), author: 'Anonymous Fighter', date: new Date().toISOString().split('T')[0], hugs: 0, replies: 0, flagged: false, ...req.body };
  communityStore.unshift(post);
  res.status(201).json(post);
});
router.post('/community/:id/hug', (req, res) => {
  const post = communityStore.find(p => p.id === req.params.id);
  if (post) {
    post.hugs += 1;
    res.json(post);
  } else res.status(404).json({ error: 'Post not found' });
});
router.post('/community/:id/flag', (req, res) => {
  const post = communityStore.find(p => p.id === req.params.id);
  if (post) {
    post.flagged = true;
    res.json({ message: 'Post flagged for moderation review.' });
  } else res.status(404).json({ error: 'Post not found' });
});

// Admin Panel Routes
router.get('/admin/stats', (req, res) => {
  res.json({
    totalUsers: 148,
    activePatients: 132,
    activeCaregivers: 16,
    totalLogsCount: symptomsStore.length,
    communityPostsCount: communityStore.length,
    flaggedPostsCount: communityStore.filter(p => p.flagged).length,
    medicationAdherenceRate: '88%'
  });
});
router.get('/admin/moderation', (req, res) => {
  res.json(communityStore.filter(p => p.flagged));
});

export default router;
