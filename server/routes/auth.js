import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cancer-companion-calm-secret-key';

// Mock in-memory database store with seed demo patient and admin
const usersStore = [
  {
    id: 'usr-demo-patient',
    name: 'Eleanor Vance',
    email: 'eleanor@example.com',
    password: 'password123',
    role: 'patient',
    diagnosis: 'Breast Cancer (Stage II)',
    doctor: 'Dr. Sarah Lin (Oncologist)',
    phone: '+1 (555) 234-5678',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-demo-admin',
    name: 'Admin Supervisor',
    email: 'admin@cancercompanion.org',
    password: 'adminpassword',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, diagnosis, role = 'patient' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name,
    email: email.toLowerCase(),
    password, // In production, bcrypt.hash
    role,
    diagnosis: diagnosis || 'General Care',
    doctor: 'Dr. Unassigned',
    createdAt: new Date().toISOString()
  };

  usersStore.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPass } = newUser;

  res.status(201).json({
    message: 'Account created successfully',
    user: userWithoutPass,
    token
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password credentials.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPass } = user;

  res.json({
    message: 'Welcome back!',
    user: userWithoutPass,
    token
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = usersStore.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: 'No account registered under this email address.' });
  }

  res.json({ message: 'Password reset link sent to ' + email + '. (Simulated reset email)' });
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization token provided' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = usersStore.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// PUT /api/auth/profile
router.put('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userIndex = usersStore.findIndex(u => u.id === decoded.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    usersStore[userIndex] = { ...usersStore[userIndex], ...req.body };
    const { password: _, ...userWithoutPass } = usersStore[userIndex];
    res.json({ message: 'Profile updated successfully', user: userWithoutPass });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;
