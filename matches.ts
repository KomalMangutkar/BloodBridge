import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { emitEvent } from '../sockets/events.js';
import { Notification } from '../models/types.js';

export const matchesRouter = Router();

// Donor responds to an emergency match (ACCEPT or DECLINE)
matchesRouter.post('/:id/respond', authMiddleware, requireRole(['DONOR']), (req: Request, res: Response) => {
  const { action } = req.body; // 'ACCEPT' or 'DECLINE'
  if (!['ACCEPT', 'DECLINE'].includes(action)) {
    res.status(400).json({ error: 'Action must be ACCEPT or DECLINE' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const match = db.matches.find(m => m.id === req.params.id);
  if (!match) {
    res.status(404).json({ error: 'Match record not found' });
    return;
  }

  const donor = db.donors.find(d => d.userId === req.user!.id);
  if (!donor || match.donorId !== donor.id) {
    res.status(403).json({ error: 'Unauthorized to respond to this match' });
    return;
  }

  const now = new Date().toISOString();
  match.status = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
  match.respondedAt = now;
  match.updatedAt = now;

  const request = db.requests.find(r => r.id === match.requestId);
  if (request) {
    // Notify requesting hospital in real time
    const hospital = db.hospitals.find(h => h.id === request.hospitalId);
    if (hospital) {
      const notif: Notification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: hospital.userId,
        title: `Donor ${action === 'ACCEPT' ? 'Accepted' : 'Declined'} Blood Request`,
        message: `${donor.fullName} (${donor.bloodGroup}) has ${action === 'ACCEPT' ? 'accepted' : 'declined'} your request for ${request.bloodGroup}.`,
        category: 'MATCH',
        priority: action === 'ACCEPT' ? 'HIGH' : 'LOW',
        isRead: false,
        actionUrl: `/hospital/dashboard?request=${request.id}`,
        createdAt: now
      };
      db.notifications.unshift(notif);
      emitEvent('notification:new', notif, hospital.userId);
    }
  }

  store.logAudit('DONOR_RESPONSE', `Donor ${donor.fullName} responded with ${action} to request ${match.requestId}`, req.user!.id, 'DONOR');
  store.save();

  emitEvent('donor:response', { match, donor, action });
  res.json({ success: true, match });
});

// Hospital selects an accepted donor candidate to start coordination
matchesRouter.post('/:id/select', authMiddleware, requireRole(['HOSPITAL', 'ADMIN']), (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();

  const match = db.matches.find(m => m.id === req.params.id);
  if (!match) {
    res.status(404).json({ error: 'Match record not found' });
    return;
  }

  const donor = db.donors.find(d => d.id === match.donorId);
  const now = new Date().toISOString();

  match.status = 'COORDINATION_STARTED';
  match.updatedAt = now;

  // Notify donor that hospital has selected them and coordinated contact
  if (donor) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: donor.userId,
      title: 'Coordination Started for Blood Donation',
      message: `The hospital has selected you for donation! Please check your coordination details.`,
      category: 'MATCH',
      priority: 'HIGH',
      isRead: false,
      actionUrl: `/donor/dashboard?match=${match.id}`,
      createdAt: now
    };
    db.notifications.unshift(notif);
    emitEvent('notification:new', notif, donor.userId);
  }

  store.logAudit('HOSPITAL_SELECT_DONOR', `Hospital selected donor candidate for coordination on match ${match.id}`, req.user!.id, req.user!.role);
  store.save();

  emitEvent('donor:selected', { match, donor });
  res.json({ success: true, match, donorContact: donor ? { name: donor.fullName, phone: donor.phone } : null });
});
