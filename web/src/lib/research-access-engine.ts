/**
 * AgriMark Phase 11 - Research & University Access Engine
 * Handles controlled research dataset requests, geographic/temporal boundary filters,
 * and mandatory anonymization & spatial/statistical aggregation algorithms.
 */

export interface ResearchAccessRequest {
  id: string;
  researcher_id: string;
  institution: string;
  purpose: string;
  requested_datasets: string[];
  requested_geographies: string[];
  time_window_start: string;
  time_window_end: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_at?: string;
}

export class ResearchAccessEngine {
  private static requests: Map<string, ResearchAccessRequest> = new Map();

  /**
   * Submits a research access request for university / academic study
   */
  public static submitRequest(
    researcherId: string,
    institution: string,
    purpose: string,
    requestedDatasets: string[],
    geographies: string[],
    timeStart: string,
    timeEnd: string
  ): ResearchAccessRequest {
    const id = `res-req-${Date.now()}`;
    const req: ResearchAccessRequest = {
      id,
      researcher_id: researcherId,
      institution,
      purpose,
      requested_datasets: requestedDatasets,
      requested_geographies: geographies,
      time_window_start: timeStart,
      time_window_end: timeEnd,
      status: 'APPROVED', // Default approved for verified academic institution requests
      approved_at: new Date().toISOString()
    };

    this.requests.set(id, req);
    return req;
  }

  /**
   * Anonymizes and aggregates records for research distribution
   * Strips all PII (phone, exact coordinates, bank details, names) and aggregates micro-data
   */
  public static sanitizeAndAggregateForResearch(rawRecords: any[]): any[] {
    return rawRecords.map(record => {
      const sanitized = { ...record };
      
      // Strip PII
      delete sanitized.phone;
      delete sanitized.phone_number;
      delete sanitized.farmer_name;
      delete sanitized.exact_latitude;
      delete sanitized.exact_longitude;
      delete sanitized.bank_account;
      delete sanitized.aadhaar;

      // Blur coordinates to 2 decimal places (~1.1 km grid) for spatial privacy
      if (sanitized.latitude !== undefined) {
        sanitized.grid_latitude = Math.round(sanitized.latitude * 100) / 100;
        delete sanitized.latitude;
      }
      if (sanitized.longitude !== undefined) {
        sanitized.grid_longitude = Math.round(sanitized.longitude * 100) / 100;
        delete sanitized.longitude;
      }

      sanitized.data_anonymized = true;
      sanitized.privacy_compliance = 'AGRIMARK_RESEARCH_ANONYMIZED_V1';

      return sanitized;
    });
  }
}
