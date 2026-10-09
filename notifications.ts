import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../database/store.js';
import { authMiddleware } from '../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', authMiddleware, (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  const userNotifications = db.notifications.filter(n => n.userId === req.user!.id);
  res.json(userNotifications);
});

notificationsRouter.put('/:id/read', authMiddleware, (req: Request, res: Response) => {
  const store = DatabaseStore.getInstance();
  const db = store.get();
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user!.id);
  if (!notif) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  notif.isRead = true;
  store.save();
  res.json(notif);
});
