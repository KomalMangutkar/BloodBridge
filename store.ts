import fs from 'fs';
import path from 'path';
import {
  User,
  DonorProfile,
  Hospital,
  BloodBank,
  BloodInventory,
  BloodRequest,
  DonorMatch,
  Donation,
  Certificate,
  DonorBadge,
  IntercityTransfer,
  Notification,
  AuditLog
} from '../models/types.js';

const DATA_DIR = path.join(process.cwd(), 'src', 'database', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  donors: DonorProfile[];
  hospitals: Hospital[];
  bloodBanks: BloodBank[];
  inventory: BloodInventory[];
  requests: BloodRequest[];
  matches: DonorMatch[];
  donations: Donation[];
  certificates: Certificate[];
  donorBadges: DonorBadge[];
  transfers: IntercityTransfer[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

export class DatabaseStore {
  private static instance: DatabaseStore;
  private data: DatabaseSchema;

  private constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db.json, initializing empty store', err);
        this.data = this.getDefaultSchema();
        this.save();
      }
    } else {
      this.data = this.getDefaultSchema();
      this.save();
    }
  }

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  private getDefaultSchema(): DatabaseSchema {
    return {
      users: [],
      donors: [],
      hospitals: [],
      bloodBanks: [],
      inventory: [],
      requests: [],
      matches: [],
      donations: [],
      certificates: [],
      donorBadges: [],
      transfers: [],
      notifications: [],
      auditLogs: []
    };
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file', err);
    }
  }

  public logAudit(action: string, details: string, userId?: string, userRole?: string): void {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userRole,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    this.save();
  }
}
