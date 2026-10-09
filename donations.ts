import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { EligibilityService } from '../services/eligibilityService.js';
import { emitEvent } from '../sockets/events.js';
import { Donation, Certificate, Notification } from '../models/types.js';

export const donationsRouter = Router();

// Hospital or Blood Bank confirms a completed donation
donationsRouter.post('/confirm', authMiddleware, requireRole(['HOSPITAL', 'BLOOD_BANK', 'ADMIN']), (req: Request, res: Response) => {
  const { matchId, donorId, requestId, unitsDonated } = req.body;

  if (!donorId) {
    res.status(400).json({ error: 'Donor ID is required' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const donor = db.donors.find(d => d.id === donorId);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }

  let institutionName = 'Verified Medical Centre';
  let hospitalId: string | undefined = undefined;
  let bloodBankId: string | undefined = undefined;

  if (req.user!.role === 'HOSPITAL') {
    const hosp = db.hospitals.find(h => h.userId === req.user!.id);
    if (hosp) {
      institutionName = hosp.name;
      hospitalId = hosp.id;
    }
  } else if (req.user!.role === 'BLOOD_BANK') {
    const bb = db.bloodBanks.find(b => b.userId === req.user!.id);
    if (bb) {
      institutionName = bb.name;
      bloodBankId = bb.id;
    }
  }

  // Prevent duplicate completion if matchId provided
  if (matchId) {
    const match = db.matches.find(m => m.id === matchId);
    if (match) {
      if (match.status === 'COMPLETED') {
        res.status(400).json({ error: 'Donation has already been completed for this match' });
        return;
      }
      match.status = 'COMPLETED';
      match.updatedAt = new Date().toISOString();
    }
  }

  const now = new Date().toISOString();
  const donationId = `don-${Date.now()}`;
  const certificateId = `cert-bb-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const donation: Donation = {
    id: donationId,
    requestId,
    donorId: donor.id,
    hospitalId,
    bloodBankId,
    institutionName,
    bloodGroup: donor.bloodGroup,
    unitsDonated: Number(unitsDonated) || 1,
    donationDate: now,
    certificateId,
    createdAt: now
  };

  db.donations.unshift(donation);

  // Generate Digital Certificate
  const certificate: Certificate = {
    id: certificateId,
    donationId,
    donorName: donor.fullName,
    donorBloodGroup: donor.bloodGroup,
    institutionName,
    donationDate: now.split('T')[0],
    verificationCode: `BB-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    createdAt: now
  };

  db.certificates.unshift(certificate);

  // Update donor profile: total donations, last donation date, next platform eligible date
  donor.totalDonations += Number(unitsDonated) || 1;
  donor.lastDonationDate = now.split('T')[0];
  donor.nextEligibleDate = EligibilityService.calculateNextEligibleDate(now);
  donor.platformEligibilityStatus = 'NOT_CURRENTLY_ELIGIBLE'; // In interval deferral period
  donor.reliabilityScore = Math.min(100, donor.reliabilityScore + 2); // Boost reliability for completed donation
  donor.updatedAt = now;

  // Award Milestone Badges if eligible
  if (donor.totalDonations >= 1 && !db.donorBadges.some(b => b.donorId === donor.id && b.badgeId === 'b-first')) {
    db.donorBadges.push({
      id: `dbadge-${Date.now()}-1`,
      donorId: donor.id,
      badgeId: 'b-first',
      badgeName: 'First Donation',
      description: 'Completed first verified blood donation',
      icon: 'Award',
      awardedAt: now
    });
  }

  if (donor.totalDonations >= 3 && !db.donorBadges.some(b => b.donorId === donor.id && b.badgeId === 'b-three')) {
    db.donorBadges.push({
      id: `dbadge-${Date.now()}-3`,
      donorId: donor.id,
      badgeId: 'b-three',
      badgeName: '3 Donations Milestone',
      description: 'Completed three verified blood donations',
      icon: 'HeartHandshake',
      awardedAt: now
    });
  }

  if (donor.totalDonations >= 5 && !db.donorBadges.some(b => b.donorId === donor.id && b.badgeId === 'b-five')) {
    db.donorBadges.push({
      id: `dbadge-${Date.now()}-5`,
      donorId: donor.id,
      badgeId: 'b-five',
      badgeName: 'Life Saver',
      description: 'Reached 5 verified donations supporting critical care',
      icon: 'Heart',
      awardedAt: now
    });
  }

  // Update request fulfillment status if linked
  if (requestId) {
    const request = db.requests.find(r => r.id === requestId);
    if (request) {
      request.unitsFulfilled += Number(unitsDonated) || 1;
      if (request.unitsFulfilled >= request.unitsRequired) {
        request.status = 'FULFILLED';
      } else {
        request.status = 'PARTIALLY_FULFILLED';
      }
      request.updatedAt = now;
      emitEvent('request:updated', request);
    }
  }

  // Send celebratory notification to donor
  const notif: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: donor.userId,
    title: 'Donation Confirmed & Certificate Issued!',
    message: `Thank you! Your donation of ${unitsDonated || 1} unit(s) at ${institutionName} has been verified. View your new certificate!`,
    category: 'DONATION',
    priority: 'HIGH',
    isRead: false,
    actionUrl: `/certificates/${certificateId}`,
    createdAt: now
  };
  db.notifications.unshift(notif);

  store.logAudit(
    'DONATION_CONFIRMED',
    `Verified donation for donor ${donor.fullName} (${donor.bloodGroup}). Issued certificate ${certificateId}`,
    req.user!.id,
    req.user!.role
  );
  store.save();

  emitEvent('donation:confirmed', { donation, certificate, donor });
  emitEvent('notification:new', notif, donor.userId);

  res.status(201).json({
    success: true,
    donation,
    certificate,
    donor
  });
});

// Get public verifiable certificate
donationsRouter.get('/certificate/:id', (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  const cert = db.certificates.find(c => c.id === req.params.id || c.verificationCode === req.params.id);
  if (!cert) {
    res.status(404).json({ error: 'Certificate not found' });
    return;
  }
  res.json(cert);
});
