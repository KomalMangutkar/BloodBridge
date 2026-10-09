import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { DistanceService } from '../services/distanceService.js';
import { emitEvent } from '../sockets/events.js';
import { IntercityTransfer, TransferStatus } from '../models/types.js';

export const transfersRouter = Router();

// Get all intercity transfers
transfersRouter.get('/', (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  res.json(db.transfers);
});

// Create intercity transfer request
transfersRouter.post('/', authMiddleware, requireRole(['HOSPITAL', 'ADMIN']), (req: Request, res: Response) => {
  const { sourceBloodBankId, bloodGroup, units } = req.body;

  if (!sourceBloodBankId || !bloodGroup || !units) {
    res.status(400).json({ error: 'Source blood bank, blood group, and units are required' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const hospital = db.hospitals.find(h => h.userId === req.user!.id);
  const bloodBank = db.bloodBanks.find(b => b.id === sourceBloodBankId);

  if (!bloodBank) {
    res.status(404).json({ error: 'Source blood bank not found' });
    return;
  }

  const destHospitalName = hospital ? hospital.name : 'Emergency Referral Hospital';
  const destCity = hospital ? hospital.city : 'New Delhi';
  const destLat = hospital ? hospital.latitude : 28.5672;
  const destLon = hospital ? hospital.longitude : 77.2100;

  const distanceKm = DistanceService.calculateDistance(bloodBank.latitude, bloodBank.longitude, destLat, destLon);
  const estimatedTransitMinutes = Math.max(30, Math.round(distanceKm * 1.5));
  const eta = new Date(Date.now() + estimatedTransitMinutes * 60000).toISOString();

  const now = new Date().toISOString();
  const transfer: IntercityTransfer = {
    id: `tr-${Date.now()}`,
    sourceBloodBankId: bloodBank.id,
    sourceBloodBankName: bloodBank.name,
    sourceCity: bloodBank.city,
    destinationHospitalId: hospital ? hospital.id : 'hosp-1',
    destinationHospitalName: destHospitalName,
    destinationCity: destCity,
    bloodGroup,
    units: Number(units),
    distanceKm,
    estimatedTransitMinutes,
    status: 'REQUESTED',
    eta,
    trackingNumber: `TRK-${bloodBank.city.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    isSimulated: true,
    createdAt: now,
    updatedAt: now
  };

  db.transfers.unshift(transfer);

  store.logAudit(
    'TRANSFER_REQUESTED',
    `Intercity transfer created for ${units} units of ${bloodGroup} from ${bloodBank.name} (${bloodBank.city}) to ${destHospitalName}`,
    req.user!.id,
    req.user!.role
  );
  store.save();

  emitEvent('transfer:updated', transfer);
  res.status(201).json(transfer);
});

// Update transfer status
transfersRouter.put('/:id/status', authMiddleware, requireRole(['BLOOD_BANK', 'HOSPITAL', 'ADMIN']), (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses: TransferStatus[] = [
    'REQUESTED', 'APPROVED', 'PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid transfer status' });
    return;
  }

  const store = DatabaseStore.getInstance();
  const db = store.get();

  const transfer = db.transfers.find(t => t.id === req.params.id);
  if (!transfer) {
    res.status(404).json({ error: 'Transfer not found' });
    return;
  }

  transfer.status = status;
  transfer.updatedAt = new Date().toISOString();

  store.logAudit(
    'TRANSFER_STATUS_CHANGED',
    `Transfer ${transfer.id} status changed to ${status}`,
    req.user!.id,
    req.user!.role
  );
  store.save();

  emitEvent('transfer:updated', transfer);
  res.json(transfer);
});
