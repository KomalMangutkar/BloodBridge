import { BloodGroup } from '../models/types.js';

/**
 * Red Blood Cell (RBC) Donor-to-Recipient Compatibility Matrix
 * Source: Standard Transfusion Medicine Red Cell Antigen Compatibility
 */
const RBC_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export const VALID_BLOOD_GROUPS: BloodGroup[] = [
  'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'
];

export class CompatibilityService {
  /**
   * Validate whether a string is a recognized blood group
   */
  public static isValidBloodGroup(group: string): group is BloodGroup {
    return VALID_BLOOD_GROUPS.includes(group as BloodGroup);
  }

  /**
   * Get all compatible RBC donor blood groups for a given recipient blood group
   */
  public static getCompatibleDonorGroups(recipientGroup: BloodGroup): BloodGroup[] {
    if (!this.isValidBloodGroup(recipientGroup)) {
      throw new Error(`Invalid recipient blood group: ${recipientGroup}`);
    }
    return RBC_COMPATIBILITY_MAP[recipientGroup];
  }

  /**
   * Check if a specific donor group is compatible with a recipient group
   */
  public static isCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
    if (!this.isValidBloodGroup(donorGroup) || !this.isValidBloodGroup(recipientGroup)) {
      return false;
    }
    const compatibleDonors = RBC_COMPATIBILITY_MAP[recipientGroup];
    return compatibleDonors.includes(donorGroup);
  }

  /**
   * Calculate compatibility score (exact match scores higher than universal donor substitute)
   */
  public static getCompatibilityScore(donorGroup: BloodGroup, recipientGroup: BloodGroup): number {
    if (!this.isCompatible(donorGroup, recipientGroup)) {
      return 0;
    }
    if (donorGroup === recipientGroup) {
      return 100; // Perfect match
    }
    return 80; // Compatible alternative (e.g. O- for A+)
  }
}
