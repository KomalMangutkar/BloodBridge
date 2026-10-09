"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const seed_js_1 = require("./database/seed.js");
const events_js_1 = require("./sockets/events.js");
const auth_js_1 = require("./routes/auth.js");
const requests_js_1 = require("./routes/requests.js");
const matches_js_1 = require("./routes/matches.js");
const donations_js_1 = require("./routes/donations.js");
const inventory_js_1 = require("./routes/inventory.js");
const transfers_js_1 = require("./routes/transfers.js");
const donors_js_1 = require("./routes/donors.js");
const admin_js_1 = require("./routes/admin.js");
const ai_js_1 = require("./routes/ai.js");
const notifications_js_1 = require("./routes/notifications.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});
(0, events_js_1.initSocketIO)(io);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Seed database on startup
(0, seed_js_1.runSeed)();
// API Routes
app.use('/api/auth', auth_js_1.authRouter);
app.use('/api/requests', requests_js_1.requestsRouter);
app.use('/api/matches', matches_js_1.matchesRouter);
app.use('/api/donations', donations_js_1.donationsRouter);
app.use('/api/inventory', inventory_js_1.inventoryRouter);
app.use('/api/transfers', transfers_js_1.transfersRouter);
app.use('/api/donors', donors_js_1.donorsRouter);
app.use('/api/admin', admin_js_1.adminRouter);
app.use('/api/ai', ai_js_1.aiRouter);
app.use('/api/notifications', notifications_js_1.notificationsRouter);
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
