import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { EligibilityService, ScreeningAnswers } from '../services/eligibilityService.js';

export const donorsRouter = Router();

// Get donors (restricted view for hospitals to protect private contact info)
donorsRouter.get('/', authMiddleware, (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();

  if (req.user!.role === 'ADMIN') {
    res.json(db.donors);
    return;
  }

  // Sanitized view: redact phone unless user is viewing their own profile
  const sanitized = db.donors.map(donor => {
    if (donor.userId === req.user!.id) {
      return donor;
    }
    return {
      ...donor,
      phone: 'Protected - Available during confirmed coordination'
    };
  });

  res.json(sanitized);
});

// Update availability status
donorsRouter.put('/availability', authMiddleware, requireRole(['DONOR']), (req: Request, res: Response) => {
  const { isAvailable } = req.body;
  const store = DatabaseStore.getInstance();
  const db = store.get();

  const donor = db.donors.find(d => d.userId === req.user!.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor profile not found' });
    return;
  }

  donor.isAvailable = Boolean(isAvailable);
  donor.updatedAt = new Date().toISOString();

  store.logAudit('DONOR_AVAILABILITY_CHANGED', `Donor availability toggled to ${donor.isAvailable}`, req.user!.id, 'DONOR');
  store.save();

  res.json(donor);
});

// Run eligibility screening check
donorsRouter.post('/screen', authMiddleware, requireRole(['DONOR']), (req: Request, res: Response) => {
  const answers: ScreeningAnswers = req.body;
  const store = DatabaseStore.getInstance();
  const db = store.get();

  const donor = db.donors.find(d => d.userId === req.user!.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor profile not found' });
    return;
  }

  // Use stored lastDonationDate if present
  if (donor.lastDonationDate && !answers.lastDonationDate) {
    answers.lastDonationDate = donor.lastDonationDate;
  }

  const result = EligibilityService.evaluateEligibility(answers);
  donor.platformEligibilityStatus = result.status;
  if (result.nextEligibleDate) {
    donor.nextEligibleDate = result.nextEligibleDate;
  }
  donor.updatedAt = new Date().toISOString();

  store.logAudit('ELIGIBILITY_SCREENING_COMPLETED', `Screening status updated to ${result.status}`, req.user!.id, 'DONOR');
  store.save();

  res.json({
    donor,
    screeningResult: result
  });
});

// Get badges and achievements for a donor
donorsRouter.get('/:id/badges', (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  const badges = db.donorBadges.filter(b => b.donorId === req.params.id);
  res.json(badges);
});
