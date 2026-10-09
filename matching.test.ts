import { describe, it, expect } from 'vitest';
import { CompatibilityService } from '../src/services/compatibilityService.js';
import { DistanceService } from '../src/services/distanceService.js';
import { EligibilityService } from '../src/services/eligibilityService.js';
import { MatchingEngine } from '../src/services/matchingEngine.js';
import { BloodRequest, DonorProfile } from '../src/models/types.js';

describe('CompatibilityService', () => {
  it('correctly maps O- universal donor', () => {
    expect(CompatibilityService.isCompatible('O-', 'O-')).toBe(true);
    expect(CompatibilityService.isCompatible('O-', 'AB+')).toBe(true);
    expect(CompatibilityService.isCompatible('O-', 'A+')).toBe(true);
  });

  it('correctly checks AB+ universal recipient', () => {
    const donors = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const;
    donors.forEach(group => {
      expect(CompatibilityService.isCompatible(group, 'AB+')).toBe(true);
    });
  });

  it('excludes incompatible donors for O+', () => {
    expect(CompatibilityService.isCompatible('A+', 'O+')).toBe(false);
    expect(CompatibilityService.isCompatible('B+', 'O+')).toBe(false);
    expect(CompatibilityService.isCompatible('AB+', 'O+')).toBe(false);
    expect(CompatibilityService.isCompatible('O+', 'O+')).toBe(true);
    expect(CompatibilityService.isCompatible('O-', 'O+')).toBe(true);
  });

  it('rejects invalid blood groups', () => {
    expect(CompatibilityService.isValidBloodGroup('X+')).toBe(false);
    expect(CompatibilityService.isCompatible('X+' as any, 'O+')).toBe(false);
  });
});

describe('DistanceService', () => {
  it('calculates accurate Haversine distance between two points', () => {
    // New Delhi (28.6139, 77.2090) to Connaught Place (28.6315, 77.2167) ~ 2.1 km
    const dist = DistanceService.calculateDistance(28.6139, 77.2090, 28.6315, 77.2167);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(2.5);
  });
});

describe('EligibilityService', () => {
  it('marks donor eligible if criteria are met', () => {
    const result = EligibilityService.evaluateEligibility({
      age: 25,
      weightKg: 65,
      hasRecentDonation: false,
      hasRecentIllnessOrFever: false,
      hasMajorSurgeryLast6Months: false,
      isOnRestrictedMedications: false
    });
    expect(result.status).toBe('ELIGIBLE_BY_PLATFORM_RULES');
  });

  it('blocks donor if recent donation was within 90 days', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30); // 30 days ago

    const result = EligibilityService.evaluateEligibility({
      age: 28,
      weightKg: 70,
      hasRecentDonation: true,
      lastDonationDate: recentDate.toISOString(),
      hasRecentIllnessOrFever: false,
      hasMajorSurgeryLast6Months: false,
      isOnRestrictedMedications: false
    });
    expect(result.status).toBe('NOT_CURRENTLY_ELIGIBLE');
  });
});

describe('MatchingEngine', () => {
  const mockHospitalRequest: BloodRequest = {
    id: 'req-1',
    hospitalId: 'hosp-1',
    bloodGroup: 'O+',
    unitsRequired: 2,
    unitsFulfilled: 0,
    urgency: 'CRITICAL',
    deadline: new Date(Date.now() + 7200000).toISOString(),
    initialRadiusKm: 10,
    currentRadiusKm: 10,
    maxRadiusKm: 50,
    preferredContact: 'phone',
    status: 'OPEN',
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'New Delhi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleDonors: DonorProfile[] = [
    {
      id: 'd-1',
      userId: 'u-1',
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      bloodGroup: 'O+', // Compatible & exact
      city: 'New Delhi',
      latitude: 28.6200,
      longitude: 77.2100,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES',
      totalDonations: 4,
      reliabilityScore: 95,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'd-2',
      userId: 'u-2',
      fullName: 'Ananya Verma',
      phone: '9876543211',
      bloodGroup: 'A+', // Incompatible for O+
      city: 'New Delhi',
      latitude: 28.6210,
      longitude: 77.2110,
      isAvailable: true,
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES',
      totalDonations: 2,
      reliabilityScore: 90,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'd-3',
      userId: 'u-3',
      fullName: 'Vikram Singh',
      phone: '9876543212',
      bloodGroup: 'O-', // Compatible universal donor
      city: 'New Delhi',
      latitude: 28.6300,
      longitude: 77.2150,
      isAvailable: false, // Unavailable
      platformEligibilityStatus: 'ELIGIBLE_BY_PLATFORM_RULES',
      totalDonations: 5,
      reliabilityScore: 92,
      notificationPreferences: { inApp: true, sms: true, email: true, whatsapp: true },
      consentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  it('filters out incompatible and unavailable donors', () => {
    const valid = MatchingEngine.filterEligibleDonors(sampleDonors, mockHospitalRequest);
    expect(valid.length).toBe(1);
    expect(valid[0].fullName).toBe('Rahul Sharma');
  });

  it('generates ranked match results deterministically', () => {
    const result = MatchingEngine.generateMatches(sampleDonors, mockHospitalRequest);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].donor.id).toBe('d-1');
    expect(result.matches[0].matchScore).toBeGreaterThan(80);
  });
});
