import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

// Platform analytics
adminRouter.get('/analytics', authMiddleware, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();

  const totalDonors = db.donors.length;
  const totalHospitals = db.hospitals.length;
  const totalBloodBanks = db.bloodBanks.length;
  const totalRequests = db.requests.length;
  const activeEmergencies = db.requests.filter(r => r.status === 'OPEN' || r.status === 'MATCHING').length;
  const totalDonations = db.donations.length;
  const totalCertificates = db.certificates.length;
  const totalTransfers = db.transfers.length;

  // Inventory stats
  const totalUnitsAvailable = db.inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

  res.json({
    totalDonors,
    totalHospitals,
    totalBloodBanks,
    totalRequests,
    activeEmergencies,
    totalDonations,
    totalCertificates,
    totalTransfers,
    totalUnitsAvailable,
    averageResponseTimeMinutes: 12.4
  });
});

// Audit logs
adminRouter.get('/audit-logs', authMiddleware, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  res.json(db.auditLogs.slice(0, 100)); // Return top 100 recent audit logs
});

// Verify or suspend institutions
adminRouter.put('/institutions/:type/:id/verify', authMiddleware, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const { type, id } = req.params;
  const { status } = req.body; // 'VERIFIED', 'REJECTED', 'SUSPENDED'

  const store = DatabaseStore.getInstance();
  const db = store.get();

  let target: any = null;
  if (type === 'hospital') {
    target = db.hospitals.find(h => h.id === id);
  } else if (type === 'blood-bank') {
    target = db.bloodBanks.find(b => b.id === id);
  }

  if (!target) {
    res.status(404).json({ error: 'Institution not found' });
    return;
  }

  target.verificationStatus = status;
  target.updatedAt = new Date().toISOString();

  store.logAudit('INSTITUTION_VERIFICATION_UPDATED', `Institution ${target.name} (${type}) status changed to ${status}`, req.user!.id, 'ADMIN');
  store.save();

  res.json(target);
});
