import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { emitEvent } from '../sockets/events.js';

export const inventoryRouter = Router();

// Get city-wide inventory with optional filters
inventoryRouter.get('/', (req: Request, res: Response) => {
  const { city, bloodGroup, bloodBankId } = req.query;
  const store = DatabaseStore.getInstance();
  const db = store.get();

  let list = db.inventory.map(item => {
    const bb = db.bloodBanks.find(b => b.id === item.bloodBankId);
    return {
      ...item,
      bloodBankName: bb ? bb.name : 'Verified Blood Center',
      city: bb ? bb.city : 'New Delhi'
    };
  });

  if (city) {
    list = list.filter(item => item.city.toLowerCase() === String(city).toLowerCase());
  }

  if (bloodGroup) {
    list = list.filter(item => item.bloodGroup === bloodGroup);
  }

  if (bloodBankId) {
    list = list.filter(item => item.bloodBankId === bloodBankId);
  }

  res.json(list);
});

// Update blood inventory (Blood Bank role only)
inventoryRouter.put('/:id', authMiddleware, requireRole(['BLOOD_BANK', 'ADMIN']), (req: Request, res: Response) => {
  const { unitsAvailable, lowStockThreshold, criticalStockThreshold } = req.body;
  const store = DatabaseStore.getInstance();
  const db = store.get();

  const item = db.inventory.find(inv => inv.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Inventory record not found' });
    return;
  }

  if (unitsAvailable !== undefined) {
    item.unitsAvailable = Math.max(0, Number(unitsAvailable));
  }
  if (lowStockThreshold !== undefined) {
    item.lowStockThreshold = Number(lowStockThreshold);
  }
  if (criticalStockThreshold !== undefined) {
    item.criticalStockThreshold = Number(criticalStockThreshold);
  }
  item.lastUpdated = new Date().toISOString();

  store.logAudit(
    'INVENTORY_UPDATED',
    `Updated inventory ${item.id} (${item.bloodGroup}) to ${item.unitsAvailable} units`,
    req.user!.id,
    req.user!.role
  );
  store.save();

  emitEvent('inventory:updated', item);
  res.json(item);
});
