import bcrypt from 'bcryptjs';
import { DatabaseStore } from './store.js';
import { BloodGroup } from '../models/types.js';

export function runSeed(override = false) {
  const store = DatabaseStore.getInstance();
  const db = store.get();

  if (db.users.length > 0 && !override) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  console.log('Seeding demo database with comprehensive records...');

  const passwordHash = bcrypt.hashSync('demo1234', 10);
  const now = new Date().toISOString();

  // 1. Users
  const users = [
    { id: 'usr-hospital', email: 'hospital@demo.com', passwordHash, role: 'HOSPITAL' as const, createdAt: now, updatedAt: now },
    { id: 'usr-donor', email: 'donor@demo.com', passwordHash, role: 'DONOR' as const, createdAt: now, updatedAt: now },
    { id: 'usr-bloodbank', email: 'bloodbank@demo.com', passwordHash, role: 'BLOOD_BANK' as const, createdAt: now, updatedAt: now },
    { id: 'usr-admin', email: 'admin@demo.com', passwordHash, role: 'ADMIN' as const, createdAt: now, updatedAt: now },

    // Additional hospitals
    { id: 'usr-hosp-2', email: 'apollo@demo.com', passwordHash, role: 'HOSPITAL' as const, createdAt: now, updatedAt: now },
    { id: 'usr-hosp-3', email: 'fortis@demo.com', passwordHash, role: 'HOSPITAL' as const, createdAt: now, updatedAt: now },
    { id: 'usr-hosp-4', email: 'max@demo.com', passwordHash, role: 'HOSPITAL' as const, createdAt: now, updatedAt: now },
    { id: 'usr-hosp-5', email: 'gangaram@demo.com', passwordHash, role: 'HOSPITAL' as const, createdAt: now, updatedAt: now },

    // Additional blood banks
    { id: 'usr-bb-2', email: 'redcross@demo.com', passwordHash, role: 'BLOOD_BANK' as const, createdAt: now, updatedAt: now },
    { id: 'usr-bb-3', email: 'rotary@demo.com', passwordHash, role: 'BLOOD_BANK' as const, createdAt: now, updatedAt: now },
    { id: 'usr-bb-4', email: 'lifeline@demo.com', passwordHash, role: 'BLOOD_BANK' as const, createdAt: now, updatedAt: now },
    { id: 'usr-bb-5', email: 'citybank@demo.com', passwordHash, role: 'BLOOD_BANK' as const, createdAt: now, updatedAt: now },

    // Additional donors
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `usr-donor-${i + 2}`,
      email: `donor${i + 2}@demo.com`,
      passwordHash,
      role: 'DONOR' as const,
      createdAt: now,
      updatedAt: now
    }))
  ];

  // 2. Hospitals (at least 5)
  const hospitals = [
    {
      id: 'hosp-1',
      userId: 'usr-hospital',
      name: 'AIIMS Central Hospital',
      registrationNumber: 'HOSP-AIIMS-001',
      city: 'New Delhi',
      address: 'Ansari Nagar, New Delhi',
      latitude: 28.5672,
      longitude: 77.2100,
      contactNumber: '+91 11 2658 8500',
      emergencyContact: '+91 11 2658 8700',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'hosp-2',
      userId: 'usr-hosp-2',
      name: 'Apollo Indraprastha Hospital',
      registrationNumber: 'HOSP-APOLLO-002',
      city: 'New Delhi',
      address: 'Sarita Vihar, Delhi Mathura Road',
      latitude: 28.5412,
      longitude: 77.2842,
      contactNumber: '+91 11 2692 5858',
      emergencyContact: '+91 11 2692 5800',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'hosp-3',
      userId: 'usr-hosp-3',
      name: 'Fortis Escorts Heart Institute',
      registrationNumber: 'HOSP-FORTIS-003',
      city: 'New Delhi',
      address: 'Okhla Road, Sukhdev Vihar',
      latitude: 28.5606,
      longitude: 77.2755,
      contactNumber: '+91 11 4713 5000',
      emergencyContact: '+91 11 4713 5100',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'hosp-4',
      userId: 'usr-hosp-4',
      name: 'Max Super Speciality Hospital',
      registrationNumber: 'HOSP-MAX-004',
      city: 'New Delhi',
      address: 'Saket, Press Enclave Road',
      latitude: 28.5283,
      longitude: 77.2112,
      contactNumber: '+91 11 2651 5050',
      emergencyContact: '+91 11 2651 5000',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'hosp-5',
      userId: 'usr-hosp-5',
      name: 'Sir Ganga Ram Hospital',
      registrationNumber: 'HOSP-SGRH-005',
      city: 'New Delhi',
      address: 'Old Rajinder Nagar',
      latitude: 28.6385,
      longitude: 77.1895,
      contactNumber: '+91 11 4225 4000',
      emergencyContact: '+91 11 4225 4100',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    }
  ];

  // 3. Blood Banks (at least 5)
  const bloodBanks = [
    {
      id: 'bb-1',
      userId: 'usr-bloodbank',
      name: 'Red Cross National Blood Bank',
      registrationNumber: 'BB-REDCROSS-01',
      city: 'New Delhi',
      address: '1 Red Cross Road, Parliament Street',
      latitude: 28.6219,
      longitude: 77.2095,
      contactNumber: '+91 11 2371 6441',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'bb-2',
      userId: 'usr-bb-2',
      name: 'Lion Blood Bank & Transfusion Center',
      registrationNumber: 'BB-LION-02',
      city: 'New Delhi',
      address: 'East of Kailash, Community Centre',
      latitude: 28.5562,
      longitude: 77.2435,
      contactNumber: '+91 11 2641 1234',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'bb-3',
      userId: 'usr-bb-3',
      name: 'Rotary Blood Bank Gurugram',
      registrationNumber: 'BB-ROTARY-03',
      city: 'Gurugram',
      address: 'Sector 56, Golf Course Road',
      latitude: 28.4312,
      longitude: 77.1025,
      contactNumber: '+91 124 257 8888',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'bb-4',
      userId: 'usr-bb-4',
      name: 'Noida Metropolis Blood Centre',
      registrationNumber: 'BB-NOIDA-04',
      city: 'Noida',
      address: 'Sector 27, Atta Market',
      latitude: 28.5744,
      longitude: 77.3298,
      contactNumber: '+91 120 456 7890',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'bb-5',
      userId: 'usr-bb-5',
      name: 'Chandigarh Regional Blood Depository',
      registrationNumber: 'BB-CHD-05',
      city: 'Chandigarh',
      address: 'Sector 12, PGI Campus',
      latitude: 30.7651,
      longitude: 76.7794,
      contactNumber: '+91 172 274 7585',
      verificationStatus: 'VERIFIED' as const,
      createdAt: now,
      updatedAt: now
    }
  ];

  // 4. Blood Inventory for all 8 blood groups
  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const inventory = [];
  for (const bb of bloodBanks) {
    for (const bg of bloodGroups) {
      let units = 12;
      if (bg === 'O-') units = 3; // Critical
      else if (bg === 'B-') units = 6; // Low
      else if (bg === 'AB+') units = 25; // Available
      else units = Math.floor(Math.random() * 15) + 5;

      inventory.push({
        id: `inv-${bb.id}-${bg}`,
        bloodBankId: bb.id,
        bloodGroup: bg,
        unitsAvailable: units,
        lowStockThreshold: 8,
        criticalStockThreshold: 4,
        lastUpdated: now
      });
    }
  }

  // 5. Donors (16 total, diverse blood groups and locations)
  const donors = [
    // Main demo donor: Rahul Sharma, O+, Eligible, Available
    {
      id: 'donor-1',
      userId: 'usr-donor',
      fullName: 'Rahul Sharma (Demo Donor)',
      phone: '+91 98765 43210',
      bloodGroup: 'O+' as const,
      city: 'New Delhi',
      address: 'Hauz Khas, New Delhi',
      latitude: 28.5494,
      longitude: 77.2001, // ~2.2 km from AIIMS
      isAvailable: true,
      lastDonationDate: '2026-06-15',
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      nextEligibleDate: '2026-09-15',
      totalDonations: 4,
      reliabilityScore: 96,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    // Universal donor, eligible, available: Priya Kapoor
    {
      id: 'donor-2',
      userId: 'usr-donor-2',
      fullName: 'Priya Kapoor',
      phone: '+91 98765 43211',
      bloodGroup: 'O-' as const,
      city: 'New Delhi',
      address: 'Green Park, New Delhi',
      latitude: 28.5589,
      longitude: 77.2028, // ~1.1 km from AIIMS
      isAvailable: true,
      lastDonationDate: '2026-05-10',
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      nextEligibleDate: '2026-08-10',
      totalDonations: 6,
      reliabilityScore: 98,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    // Compatible donor, but UNAVAILABLE: Amit Verma
    {
      id: 'donor-3',
      userId: 'usr-donor-3',
      fullName: 'Amit Verma',
      phone: '+91 98765 43212',
      bloodGroup: 'O+' as const,
      city: 'New Delhi',
      address: 'Lajpat Nagar',
      latitude: 28.5700,
      longitude: 77.2370,
      isAvailable: false, // Inactive / unavailable
      lastDonationDate: '2026-07-01',
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      nextEligibleDate: '2026-10-01',
      totalDonations: 2,
      reliabilityScore: 88,
      notificationPreferences: { inApp: true, sms: false, email: true, whatsapp: false },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    // INCOMPATIBLE blood group: Sneha Patel (A+)
    {
      id: 'donor-4',
      userId: 'usr-donor-4',
      fullName: 'Sneha Patel',
      phone: '+91 98765 43213',
      bloodGroup: 'A+' as const, // Incompatible with O+ request
      city: 'New Delhi',
      address: 'Safdarjung Enclave',
      latitude: 28.5620,
      longitude: 77.1950,
      isAvailable: true,
      lastDonationDate: '2026-04-12',
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      nextEligibleDate: '2026-07-12',
      totalDonations: 3,
      reliabilityScore: 92,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    // Compatible, but INELIGIBLE (recent donation within 90 days): Vikram Malhotra
    {
      id: 'donor-5',
      userId: 'usr-donor-5',
      fullName: 'Vikram Malhotra',
      phone: '+91 98765 43214',
      bloodGroup: 'O+' as const,
      city: 'New Delhi',
      address: 'South Extension',
      latitude: 28.5728,
      longitude: 77.2185,
      isAvailable: true,
      lastDonationDate: '2026-09-20', // Donated 19 days ago!
      platformEligibilityStatus: 'NOT_CURRENTLY_ELIGIBLE' as const,
      nextEligibleDate: '2026-12-19',
      totalDonations: 5,
      reliabilityScore: 95,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    // Compatible O+ donor in Gurugram (~25km away)
    {
      id: 'donor-6',
      userId: 'usr-donor-6',
      fullName: 'Kavita Rao',
      phone: '+91 98765 43215',
      bloodGroup: 'O+' as const,
      city: 'Gurugram',
      address: 'Cyber City, Phase 2',
      latitude: 28.4900,
      longitude: 77.0900,
      isAvailable: true,
      lastDonationDate: '2026-05-01',
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      nextEligibleDate: '2026-08-01',
      totalDonations: 1,
      reliabilityScore: 85,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    // Other varied donors
    {
      id: 'donor-7',
      userId: 'usr-donor-7',
      fullName: 'Arjun Nair',
      phone: '+91 98765 43216',
      bloodGroup: 'B+' as const,
      city: 'New Delhi',
      latitude: 28.5800,
      longitude: 77.2200,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      totalDonations: 2,
      reliabilityScore: 90,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'donor-8',
      userId: 'usr-donor-8',
      fullName: 'Zoya Khan',
      phone: '+91 98765 43217',
      bloodGroup: 'AB-' as const,
      city: 'New Delhi',
      latitude: 28.5300,
      longitude: 77.2000,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      totalDonations: 7,
      reliabilityScore: 97,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'donor-9',
      userId: 'usr-donor-9',
      fullName: 'Tanvi Joshi',
      phone: '+91 98765 43218',
      bloodGroup: 'A-' as const,
      city: 'Noida',
      latitude: 28.5700,
      longitude: 77.3200,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      totalDonations: 3,
      reliabilityScore: 91,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'donor-10',
      userId: 'usr-donor-10',
      fullName: 'Devansh Roy',
      phone: '+91 98765 43219',
      bloodGroup: 'AB+' as const,
      city: 'New Delhi',
      latitude: 28.6100,
      longitude: 77.2300,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      totalDonations: 1,
      reliabilityScore: 82,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'donor-11',
      userId: 'usr-donor-11',
      fullName: 'Meera Deshmukh',
      phone: '+91 98765 43220',
      bloodGroup: 'O+' as const,
      city: 'New Delhi',
      address: 'Greater Kailash 1',
      latitude: 28.5525,
      longitude: 77.2405, // ~3.5 km
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES' as const,
      totalDonations: 5,
      reliabilityScore: 94,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'donor-12',
      userId: 'usr-donor-12',
      fullName: 'Rohan Mehra',
      phone: '+91 98765 43221',
      bloodGroup: 'B-' as const,
      city: 'New Delhi',
      latitude: 28.5900,
      longitude: 77.2200,
      isAvailable: true,
      platformEligibilityStatus: 'REVIEW_REQUIRED' as const,
      totalDonations: 0,
      reliabilityScore: 75,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  // 6. Badges and Donor Badges
  const donorBadges = [
    {
      id: 'dbadge-1',
      donorId: 'donor-1',
      badgeId: 'b-first',
      badgeName: 'First Donation',
      description: 'Completed first verified blood donation',
      icon: 'Award',
      awardedAt: '2025-01-10T10:00:00Z'
    },
    {
      id: 'dbadge-2',
      donorId: 'donor-1',
      badgeId: 'b-three',
      badgeName: '3 Donations Milestone',
      description: 'Completed three verified blood donations',
      icon: 'HeartHandshake',
      awardedAt: '2025-10-14T11:00:00Z'
    },
    {
      id: 'dbadge-3',
      donorId: 'donor-1',
      badgeId: 'b-hero',
      badgeName: 'Emergency Hero',
      description: 'Responded to critical emergency blood request within 15 minutes',
      icon: 'Flame',
      awardedAt: '2026-03-20T14:30:00Z'
    }
  ];

  // 7. Completed Donations & Certificates
  const pastDonationDate = '2026-06-15T09:30:00Z';
  const donations = [
    {
      id: 'don-demo-1',
      requestId: 'req-past-1',
      donorId: 'donor-1',
      hospitalId: 'hosp-1',
      institutionName: 'AIIMS Central Hospital',
      bloodGroup: 'O+' as const,
      unitsDonated: 1,
      donationDate: pastDonationDate,
      certificateId: 'cert-bb-2026-0042',
      createdAt: pastDonationDate
    }
  ];

  const certificates = [
    {
      id: 'cert-bb-2026-0042',
      donationId: 'don-demo-1',
      donorName: 'Rahul Sharma (Demo Donor)',
      donorBloodGroup: 'O+' as const,
      institutionName: 'AIIMS Central Hospital',
      donationDate: '2026-06-15',
      verificationCode: 'BB-CERT-AIIMS-9841',
      createdAt: pastDonationDate
    }
  ];

  // 8. Intercity Transfers
  const transfers = [
    {
      id: 'tr-101',
      sourceBloodBankId: 'bb-3',
      sourceBloodBankName: 'Rotary Blood Bank Gurugram',
      sourceCity: 'Gurugram',
      destinationHospitalId: 'hosp-1',
      destinationHospitalName: 'AIIMS Central Hospital',
      destinationCity: 'New Delhi',
      bloodGroup: 'O-' as const,
      units: 4,
      distanceKm: 28.5,
      estimatedTransitMinutes: 45,
      status: 'IN_TRANSIT' as const,
      eta: new Date(Date.now() + 1800000).toISOString(),
      trackingNumber: 'TRK-GUR-DEL-894',
      isSimulated: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: now
    }
  ];

  // 9. Notifications
  const notifications = [
    {
      id: 'notif-1',
      userId: 'usr-donor',
      title: 'Welcome to BloodBridge',
      message: 'Your donor profile is active and verified for emergency matching.',
      category: 'SYSTEM' as const,
      priority: 'LOW' as const,
      isRead: true,
      createdAt: now
    }
  ];

  // Store seeded records
  db.users = users;
  db.hospitals = hospitals;
  db.bloodBanks = bloodBanks;
  db.inventory = inventory;
  db.donors = donors;
  db.donorBadges = donorBadges;
  db.donations = donations;
  db.certificates = certificates;
  db.transfers = transfers;
  db.notifications = notifications;
  db.requests = [];
  db.matches = [];
  db.auditLogs = [];

  store.logAudit('SYSTEM_SEED', 'Seeded demo database with initial users, hospitals, blood banks, inventory, and donors.');
  store.save();
  console.log('Seeding completed successfully!');
}
