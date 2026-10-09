import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseStore } from '../database/store.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { User, UserRole } from '../models/types.js';

export const authRouter = Router();

authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, role, name, bloodGroup, city, address, phone, registrationNumber } = req.body;

  if (!email || !password || !role) {
    res.status(400).json({ error: 'Email, password, and role are required' });
    return;
  }

  const validRoles: UserRole[] = ['DONOR', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Invalid user role' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'User with this email already exists' });
    return;
  }

  const now = new Date().toISOString();
  const userId = `usr-${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id: userId,
    email,
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now
  };

  db.users.push(newUser);

  // Create role-specific entity
  if (role === 'DONOR') {
    db.donors.push({
      id: `donor-${Date.now()}`,
      userId,
      fullName: name || 'Anonymous Donor',
      phone: phone || '+91 99999 99999',
      bloodGroup: bloodGroup || 'O+',
      city: city || 'New Delhi',
      address: address || '',
      latitude: 28.6139,
      longitude: 77.2090,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES',
      totalDonations: 0,
      reliabilityScore: 80,
      notificationPreferences: { inApp: true, sms: false, email: true, whatsapp: false },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    });
  } else if (role === 'HOSPITAL') {
    db.hospitals.push({
      id: `hosp-${Date.now()}`,
      userId,
      name: name || 'Registered Hospital',
      registrationNumber: registrationNumber || `REG-${Date.now()}`,
      city: city || 'New Delhi',
      address: address || '',
      latitude: 28.5672,
      longitude: 77.2100,
      contactNumber: phone || '+91 11 2000 0000',
      emergencyContact: phone || '+91 11 2000 0000',
      verificationStatus: 'PENDING',
      createdAt: now,
      updatedAt: now
    });
  } else if (role === 'BLOOD_BANK') {
    db.bloodBanks.push({
      id: `bb-${Date.now()}`,
      userId,
      name: name || 'Registered Blood Bank',
      registrationNumber: registrationNumber || `BB-${Date.now()}`,
      city: city || 'New Delhi',
      address: address || '',
      latitude: 28.6219,
      longitude: 77.2095,
      contactNumber: phone || '+91 11 3000 0000',
      verificationStatus: 'PENDING',
      createdAt: now,
      updatedAt: now
    });
  }

  store.logAudit('USER_REGISTERED', `New account created: ${email} as ${role}`, userId, role);
  store.save();

  const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: userId, email, role } });
});

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  let profile = null;
  if (user.role === 'DONOR') {
    profile = db.donors.find(d => d.userId === user.id) || null;
  } else if (user.role === 'HOSPITAL') {
    profile = db.hospitals.find(h => h.userId === user.id) || null;
  } else if (user.role === 'BLOOD_BANK') {
    profile = db.bloodBanks.find(b => b.userId === user.id) || null;
  }

  store.logAudit('USER_LOGIN', `User ${user.email} logged in successfully`, user.id, user.role);

  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    profile
  });
});

authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const store = DatabaseStore.getInstance();
    const db = store.get();

    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let profile = null;
    if (user.role === 'DONOR') {
      profile = db.donors.find(d => d.userId === user.id) || null;
    } else if (user.role === 'HOSPITAL') {
      profile = db.hospitals.find(h => h.userId === user.id) || null;
    } else if (user.role === 'BLOOD_BANK') {
      profile = db.bloodBanks.find(b => b.userId === user.id) || null;
    }

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      profile
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
