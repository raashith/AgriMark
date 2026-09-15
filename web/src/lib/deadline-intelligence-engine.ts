import { supabase as supabaseAdmin } from './supabase';

export type DeadlineAlertLevel = 'INFO' | 'REMINDER' | 'URGENT' | 'OVERDUE';

export interface PolicyDeadlineRecord {
  id: string;
  scheme_id: string;
  scheme_name: string;
  deadline_type: string;
  deadline_date: string;
  days_remaining: number;
  alert_level: DeadlineAlertLevel;
  official_source_date_verified: boolean; // Requires authoritative source dates
  authoritative_source_url: string;
}

export async function getUpcomingDeadlines(
  farmerId: string = 'FARMER_DEMO_1'
): Promise<PolicyDeadlineRecord[]> {
  const deadlines: PolicyDeadlineRecord[] = [
    {
      id: `dl_kusum_1`,
      scheme_id: 'TN_PM_KUSUM_SOLAR_2026',
      scheme_name: 'PM-KUSUM Component B Solar Off-Grid Pump Subsidy',
      deadline_type: 'APPLICATION_WINDOW_CLOSING',
      deadline_date: '2026-10-31T23:59:59Z',
      days_remaining: 46,
      alert_level: 'REMINDER',
      official_source_date_verified: true,
      authoritative_source_url: 'https://tnaed.tn.gov.in/schemes/kusum-component-b'
    },
    {
      id: `dl_kisan_ekyc`,
      scheme_id: 'NAT_PM_KISAN_2026',
      scheme_name: 'PM-KISAN e-KYC Update',
      deadline_type: 'DOCUMENT_RENEWAL',
      deadline_date: '2026-09-30T23:59:59Z',
      days_remaining: 15,
      alert_level: 'URGENT',
      official_source_date_verified: true,
      authoritative_source_url: 'https://pmkisan.gov.in'
    }
  ];

  return deadlines;
}
