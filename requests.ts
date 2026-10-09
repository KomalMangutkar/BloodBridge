import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { MatchingEngine } from '../services/matchingEngine.js';
import { CompatibilityService } from '../services/compatibilityService.js';
import { emitEvent } from '../sockets/events.js';
import { BloodRequest, DonorMatch, Notification } from '../models/types.js';

export const requestsRouter = Router();

// Create emergency blood request
requestsRouter.post('/', authMiddleware, requireRole(['HOSPITAL', 'ADMIN']), (req: Request, res: Response) => {
  const { bloodGroup, unitsRequired, urgency, deadline, notes, initialRadiusKm, maxRadiusKm, preferredContact } = req.body;

  if (!bloodGroup || !unitsRequired || !urgency || !deadline) {
    res.status(400).json({ error: 'Missing required request fields' });
    return;
  }

  if (!CompatibilityService.isValidBloodGroup(bloodGroup)) {
    res.status(400).json({ error: 'Invalid blood group specified' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const hospital = db.hospitals.find(h => h.userId === req.user!.id);
  if (!hospital && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'No hospital profile linked to this user' });
    return;
  }

  const hospitalId = hospital ? hospital.id : 'hosp-1';
  const hospitalName = hospital ? hospital.name : 'Emergency Referral Center';
  const lat = hospital ? hospital.latitude : 28.5672;
  const lon = hospital ? hospital.longitude : 77.2100;
  const city = hospital ? hospital.city : 'New Delhi';

  const now = new Date().toISOString();
  const requestId = `req-${Date.now()}`;

  const bloodRequest: BloodRequest = {
    id: requestId,
    hospitalId,
    hospitalName,
    bloodGroup,
    unitsRequired: Number(unitsRequired),
    unitsFulfilled: 0,
    urgency,
    deadline,
    notes: notes || '',
    initialRadiusKm: Number(initialRadiusKm) || 10,
    currentRadiusKm: Number(initialRadiusKm) || 10,
    maxRadiusKm: Number(maxRadiusKm) || 50,
    preferredContact: preferredContact || 'Phone / In-App',
    status: 'OPEN',
    latitude: lat,
    longitude: lon,
    city,
    createdAt: now,
    updatedAt: now
  };

  db.requests.unshift(bloodRequest);

  // Run matching engine immediately
  const matchResult = MatchingEngine.generateMatches(db.donors, bloodRequest);
  bloodRequest.currentRadiusKm = matchResult.finalRadiusKm;

  // Persist matches and generate notifications for each matched donor
  matchResult.matches.forEach(item => {
    const matchId = `match-${requestId}-${item.donor.id}`;
    const donorMatch: DonorMatch = {
      id: matchId,
      requestId,
      donorId: item.donor.id,
      donorName: item.donor.fullName,
      donorBloodGroup: item.donor.bloodGroup,
      distanceKm: item.distanceKm,
      matchScore: item.matchScore,
      matchReason: item.matchReason,
      status: 'NOTIFIED',
      notifiedAt: now,
      updatedAt: now
    };
    db.matches.push(donorMatch);

    // Create in-app notification for donor
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: item.donor.userId,
      title: `URGENT: ${bloodRequest.urgency} Blood Request for ${bloodGroup}`,
      message: `${hospitalName} needs ${bloodGroup} blood urgently (${item.distanceKm} km away). Please respond!`,
      category: 'REQUEST',
      priority: bloodRequest.urgency === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      isRead: false,
      actionUrl: `/donor/dashboard?request=${requestId}`,
      createdAt: now
    };
    db.notifications.unshift(notif);

    // Emit live socket event to donor room
    emitEvent('notification:new', notif, item.donor.userId);
    emitEvent('donor:matched', { request: bloodRequest, match: donorMatch }, item.donor.userId);
  });

  store.logAudit(
    'REQUEST_CREATED',
    `Created ${urgency} request for ${unitsRequired} units of ${bloodGroup} (Matches generated: ${matchResult.matches.length})`,
    req.user!.id,
    req.user!.role
  );
  store.save();

  // Broadcast new request
  emitEvent('request:created', { request: bloodRequest, matchesCount: matchResult.matches.length });

  res.status(201).json({
    request: bloodRequest,
    matches: matchResult.matches,
    radiusExpansionSteps: matchResult.expansionStepsTaken
  });
});

// Get all requests (filtered by hospital for hospital role, or public/all for admin)
requestsRouter.get('/', (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  res.json(db.requests);
});

// Get specific request details
requestsRouter.get('/:id', (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  const request = db.requests.find(r => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(request);
});

// Get matches and donor responses for a request
requestsRouter.get('/:id/matches', authMiddleware, (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  const matches = db.matches.filter(m => m.requestId === req.params.id);
  res.json(matches);
});

// Update request status (e.g. Cancel or Close)
requestsRouter.put('/:id/status', authMiddleware, requireRole(['HOSPITAL', 'ADMIN']), (req: Request, res: Response) => {
  const { status } = req.body;
  const store = DatabaseStore.getInstance();
  const db = store.get();

  const request = db.requests.find(r => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();

  store.logAudit('REQUEST_STATUS_UPDATED', `Request ${request.id} status changed to ${status}`, req.user!.id, req.user!.role);
  store.save();

  emitEvent('request:updated', request);
  res.json(request);
});
