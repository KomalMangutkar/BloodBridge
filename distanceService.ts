export class DistanceService {
  /**
   * Earth's mean radius in kilometres
   */
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculate great-circle distance between two geographic coordinates using the Haversine formula
   * @param lat1 Latitude of point 1 in degrees
   * @param lon1 Longitude of point 1 in degrees
   * @param lat2 Latitude of point 2 in degrees
   * @param lon2 Longitude of point 2 in degrees
   * @returns Distance in kilometres, rounded to two decimal places
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_KM * c;

    return Math.round(distance * 100) / 100;
  }

  /**
   * Calculate distance score (higher score for closer distances, decreasing smoothly)
   */
  public static getDistanceScore(distanceKm: number, maxRadiusKm: number): number {
    if (distanceKm <= 0) return 100;
    if (distanceKm >= maxRadiusKm) return 10;
    // Normalized score from 100 down to 10 based on distance ratio
    const score = 100 - (distanceKm / maxRadiusKm) * 90;
    return Math.max(10, Math.min(100, Math.round(score)));
  }
}
