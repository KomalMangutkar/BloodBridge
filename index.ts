import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { runSeed } from './database/seed.js';
import { initSocketIO } from './sockets/events.js';
import { authRouter } from './routes/auth.js';
import { requestsRouter } from './routes/requests.js';
import { matchesRouter } from './routes/matches.js';
import { donationsRouter } from './routes/donations.js';
import { inventoryRouter } from './routes/inventory.js';
import { transfersRouter } from './routes/transfers.js';
import { donorsRouter } from './routes/donors.js';
import { adminRouter } from './routes/admin.js';
import { aiRouter } from './routes/ai.js';
import { notificationsRouter } from './routes/notifications.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

initSocketIO(io);

app.use(cors());
app.use(express.json());

// Seed database on startup
runSeed();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/donors', donorsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'BloodBridge AI Emergency Response',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`BloodBridge server running on http://localhost:${PORT}`);
});
