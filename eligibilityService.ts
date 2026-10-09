import { DonorProfile, PlatformEligibilityStatus } from '../models/types.js';

export interface ScreeningAnswers {
  age: number;
  weightKg: number;
  hasRecentDonation: boolean;
  lastDonationDate?: string;
  hasRecentIllnessOrFever: boolean;
  hasMajorSurgeryLast6Months: boolean;
  isPregnantOrLactating?: boolean;
  isOnRestrictedMedications: boolean;
}

export class EligibilityService {
  /**
   * Configurable minimum days between whole blood donations (standard default: 90 days / 3 months)
   */
  public static MINIMUM_DONATION_INTERVAL_DAYS = 90;

  /**
   * Evaluate platform eligibility status based on screening inputs and history
   */
  public static evaluateEligibility(screening: ScreeningAnswers): {
    status: PlatformEligibilityStatus;
    nextEligibleDate?: string;
    reasons: string[];
  } {
    const reasons: string[] = [];

    // Age validation
    if (screening.age < 18 || screening.age > 65) {
      reasons.push('Donor age must be between 18 and 65 years');
    }

    // Weight validation
    if (screening.weightKg < 50) {
      reasons.push('Donor weight must be at least 50 kg');
    }

    // Recent Illness
    if (screening.hasRecentIllnessOrFever) {
      reasons.push('Temporary recovery deferral due to recent illness/fever');
    }

    // Major surgery
    if (screening.hasMajorSurgeryLast6Months) {
      reasons.push('Temporary deferral due to surgery in past 6 months');
    }

    // Pregnancy
    if (screening.isPregnantOrLactating) {
      reasons.push('Temporary deferral during pregnancy or lactation');
    }

    // Restricted medication
    if (screening.isOnRestrictedMedications) {
      reasons.push('Review required due to active prescription medication');
    }

    // Donation interval check
    let nextEligibleDate: string | undefined = undefined;
    if (screening.lastDonationDate) {
      const lastDate = new Date(screening.lastDonationDate);
      if (!isNaN(lastDate.getTime())) {
        const eligibleDate = new Date(lastDate);
        eligibleDate.setDate(eligibleDate.getDate() + this.MINIMUM_DONATION_INTERVAL_DAYS);
        nextEligibleDate = eligibleDate.toISOString().split('T')[0];

        const now = new Date();
        if (eligibleDate > now) {
          const daysLeft = Math.ceil((eligibleDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          reasons.push(`Minimum donation interval active (${daysLeft} days remaining)`);
        }
      }
    }

    if (reasons.length === 0) {
      return {
        status: 'ELIGIBLE_BY_PLATFORM_RULES',
        nextEligibleDate: nextEligibleDate || new Date().toISOString().split('T')[0],
        reasons: ['Meets platform baseline screening requirements']
      };
    }

    // If only medication review is present, status is REVIEW_REQUIRED
    const onlyMedication = reasons.length === 1 && screening.isOnRestrictedMedications;
    return {
      status: onlyMedication ? 'REVIEW_REQUIRED' : 'NOT_CURRENTLY_ELIGIBLE',
      nextEligibleDate,
      reasons
    };
  }

  /**
   * Calculate next eligible date following a verified donation
   */
  public static calculateNextEligibleDate(donationDateIso: string): string {
    const donationDate = new Date(donationDateIso);
    const nextDate = new Date(donationDate);
    nextDate.setDate(nextDate.getDate() + this.MINIMUM_DONATION_INTERVAL_DAYS);
    return nextDate.toISOString().split('T')[0];
  }

  /**
   * Check if a donor profile passes platform screening hard-filter
   */
  public static isPlatformEligibleToMatch(donor: DonorProfile): boolean {
    if (donor.platformEligibilityStatus !== 'ELIGIBLE_BY_PLATFORM_RULES') {
      return false;
    }

    if (donor.nextEligibleDate) {
      const eligibleDate = new Date(donor.nextEligibleDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eligibleDate > today) {
        return false;
      }
    }

    return true;
  }
}
