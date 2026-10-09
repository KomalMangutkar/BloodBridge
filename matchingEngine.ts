import { 
  BloodGroup, 
  BloodRequest, 
  DonorProfile, 
  DonorMatch 
} from '../models/types.js';
import { CompatibilityService } from './compatibilityService.js';
import { DistanceService } from './distanceService.js';
import { EligibilityService } from './eligibilityService.js';

export interface ScoredDonor {
  donor: DonorProfile;
  distanceKm: number;
  matchScore: number;
  matchReason: string;
}

export class MatchingEngine {
  /**
   * Search radius sequence in kilometres
   */
  public static readonly RADIUS_STEPS = [5, 10, 25, 50, 100];

  /**
   * 1. Hard Filter: Determine if a donor is valid for emergency matching
   */
  public static filterEligibleDonors(
    donors: DonorProfile[],
    request: BloodRequest
  ): DonorProfile[] {
    return donors.filter((donor) => {
      // 1. Availability filter
      if (!donor.isAvailable) {
        return false;
      }

      // 2. Platform eligibility filter
      if (!EligibilityService.isPlatformEligibleToMatch(donor)) {
        return false;
      }

      // 3. RBC Blood Group Compatibility filter
      if (!CompatibilityService.isCompatible(donor.bloodGroup, request.bloodGroup)) {
        return false;
      }

      return true;
    });
  }

  /**
   * 2. Calculate Distance
   */
  public static calculateDistance(
    donorLocation: { latitude: number; longitude: number },
    hospitalLocation: { latitude: number; longitude: number }
  ): number {
    return DistanceService.calculateDistance(
      donorLocation.latitude,
      donorLocation.longitude,
      hospitalLocation.latitude,
      hospitalLocation.longitude
    );
  }

  /**
   * 3. Calculate Weighted Match Score among valid candidate donors
   * Weights:
   * - Blood compatibility precision: 40%
   * - Platform eligibility confidence: 20%
   * - Distance proximity: 15%
   * - Availability & freshness: 10%
   * - Emergency Priority urgency factor: 10%
   * - Verified donor reliability score: 5%
   */
  public static calculateMatchScore(
    donor: DonorProfile,
    request: BloodRequest,
    distanceKm: number,
    currentRadiusKm: number
  ): number {
    const compatibilityScore = CompatibilityService.getCompatibilityScore(donor.bloodGroup, request.bloodGroup);
    const eligibilityScore = 100; // Passed hard filter
    const distanceScore = DistanceService.getDistanceScore(distanceKm, currentRadiusKm);
    const availabilityScore = donor.isAvailable ? 100 : 0;
    
    // Urgency factor
    let urgencyScore = 70;
    if (request.urgency === 'CRITICAL') urgencyScore = 100;
    else if (request.urgency === 'URGENT') urgencyScore = 85;

    // Reliability factor (donor's verified track record)
    const reliabilityScore = donor.reliabilityScore || 80;

    const weightedScore =
      compatibilityScore * 0.40 +
      eligibilityScore * 0.20 +
      distanceScore * 0.15 +
      availabilityScore * 0.10 +
      urgencyScore * 0.10 +
      reliabilityScore * 0.05;

    return Math.min(100, Math.max(1, Math.round(weightedScore)));
  }

  /**
   * 4. Rank candidates deterministically
   */
  public static rankDonors(
    validDonors: DonorProfile[],
    request: BloodRequest,
    currentRadiusKm: number
  ): ScoredDonor[] {
    const scoredList: ScoredDonor[] = validDonors.map((donor) => {
      const distanceKm = this.calculateDistance(
        { latitude: donor.latitude, longitude: donor.longitude },
        { latitude: request.latitude, longitude: request.longitude }
      );

      const score = this.calculateMatchScore(donor, request, distanceKm, currentRadiusKm);
      const isExactGroup = donor.bloodGroup === request.bloodGroup;
      const groupNote = isExactGroup ? `Exact ${donor.bloodGroup} match` : `Compatible ${donor.bloodGroup} RBC donor`;

      const matchReason = `${groupNote}, verified platform eligibility, available, approx. ${distanceKm} km away (Score: ${score}/100)`;

      return {
        donor,
        distanceKm,
        matchScore: score,
        matchReason
      };
    });

    // Sort descending by match score; secondary sort by closer distance
    return scoredList.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.distanceKm - b.distanceKm;
    });
  }

  /**
   * 5. Match Engine core execution with progressive radius expansion
   */
  public static generateMatches(
    allDonors: DonorProfile[],
    request: BloodRequest,
    targetCount: number = 5
  ): {
    matches: ScoredDonor[];
    finalRadiusKm: number;
    expansionStepsTaken: number[];
  } {
    // Apply hard filters first
    const eligibleDonors = this.filterEligibleDonors(allDonors, request);

    let currentRadiusIndex = this.RADIUS_STEPS.indexOf(request.currentRadiusKm);
    if (currentRadiusIndex === -1) {
      currentRadiusIndex = 0;
    }

    const stepsTaken: number[] = [];
    let selectedRadius = this.RADIUS_STEPS[currentRadiusIndex];
    let matchedCandidates: ScoredDonor[] = [];

    while (currentRadiusIndex < this.RADIUS_STEPS.length) {
      selectedRadius = this.RADIUS_STEPS[currentRadiusIndex];
      stepsTaken.push(selectedRadius);

      const ranked = this.rankDonors(eligibleDonors, request, selectedRadius);
      const withinRadius = ranked.filter(item => item.distanceKm <= selectedRadius);

      if (withinRadius.length >= targetCount || selectedRadius >= request.maxRadiusKm) {
        matchedCandidates = withinRadius;
        break;
      }

      currentRadiusIndex++;
    }

    // Fallback if none found within maxRadius, take whatever is available up to maxRadius
    if (matchedCandidates.length === 0) {
      const ranked = this.rankDonors(eligibleDonors, request, request.maxRadiusKm);
      matchedCandidates = ranked.filter(item => item.distanceKm <= request.maxRadiusKm);
    }

    return {
      matches: matchedCandidates,
      finalRadiusKm: selectedRadius,
      expansionStepsTaken: stepsTaken
    };
  }
}
