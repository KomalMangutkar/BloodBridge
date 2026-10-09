export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type UserRole = 'DONOR' | 'HOSPITAL' | 'BLOOD_BANK' | 'ADMIN';

export type RequestUrgency = 'CRITICAL' | 'URGENT' | 'NORMAL';

export type RequestStatus = 
  | 'OPEN' 
  | 'MATCHING' 
  | 'PARTIALLY_FULFILLED' 
  | 'FULFILLED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export type MatchStatus = 
  | 'NOTIFIED' 
  | 'ACCEPTED' 
  | 'DECLINED' 
  | 'SELECTED' 
  | 'COORDINATION_STARTED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type PlatformEligibilityStatus = 
  | 'ELIGIBLE_BY_PLATFORM_RULES' 
  | 'NOT_CURRENTLY_ELIGIBLE' 
  | 'REVIEW_REQUIRED' 
  | 'NOT_SCREENED';

export type InstitutionVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type TransferStatus = 
  | 'REQUESTED' 
  | 'APPROVED' 
  | 'PREPARING' 
  | 'DISPATCHED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  address?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: string;
  address?: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  lastDonationDate?: string;
  platformEligibilityStatus: PlatformEligibilityStatus;
  nextEligibleDate?: string;
  totalDonations: number;
  reliabilityScore: number; // 0 - 100
  notificationPreferences: {
    inApp: boolean;
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  id: string;
  userId: string;
  name: string;
  registrationNumber: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  emergencyContact: string;
  verificationStatus: InstitutionVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BloodBank {
  id: string;
  userId: string;
  name: string;
  registrationNumber: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  verificationStatus: InstitutionVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BloodInventory {
  id: string;
  bloodBankId: string;
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  lastUpdated: string;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  urgency: RequestUrgency;
  deadline: string; // ISO Date
  notes?: string;
  initialRadiusKm: number;
  currentRadiusKm: number;
  maxRadiusKm: number;
  preferredContact: string;
  status: RequestStatus;
  latitude: number;
  longitude: number;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonorMatch {
  id: string;
  requestId: string;
  donorId: string;
  donorName?: string;
  donorBloodGroup?: BloodGroup;
  distanceKm: number;
  matchScore: number;
  matchReason: string;
  status: MatchStatus;
  notifiedAt: string;
  respondedAt?: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  requestId?: string;
  donorId: string;
  hospitalId?: string;
  bloodBankId?: string;
  institutionName: string;
  bloodGroup: BloodGroup;
  unitsDonated: number;
  donationDate: string;
  certificateId: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  donationId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  institutionName: string;
  donationDate: string;
  verificationCode: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export interface DonorBadge {
  id: string;
  donorId: string;
  badgeId: string;
  badgeName: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface IntercityTransfer {
  id: string;
  sourceBloodBankId: string;
  sourceBloodBankName: string;
  sourceCity: string;
  destinationHospitalId: string;
  destinationHospitalName: string;
  destinationCity: string;
  bloodGroup: BloodGroup;
  units: number;
  distanceKm: number;
  estimatedTransitMinutes: number;
  status: TransferStatus;
  eta: string;
  trackingNumber: string;
  isSimulated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'REQUEST' | 'MATCH' | 'DONATION' | 'SYSTEM' | 'TRANSFER';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userRole?: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}
