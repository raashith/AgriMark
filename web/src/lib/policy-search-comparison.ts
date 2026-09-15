import { GovernmentSchemeRecord, getActiveSchemes } from './scheme-intelligence-engine';

export interface SchemeSearchFilters {
  jurisdiction?: 'National' | 'State';
  state?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SchemeComparisonResult {
  schemes: GovernmentSchemeRecord[];
  comparison_matrix: Array<{
    field: string;
    scheme_1_value: string;
    scheme_2_value: string;
  }>;
  disclaimer: string;
}

export async function searchGovernmentSchemes(filters: SchemeSearchFilters = {}): Promise<{
  data: GovernmentSchemeRecord[];
  total: number;
  page: number;
  limit: number;
}> {
  const allSchemes = await getActiveSchemes(filters.jurisdiction, filters.state || 'Tamil Nadu');
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;

  return {
    data: allSchemes.slice(start, start + limit),
    total: allSchemes.length,
    page,
    limit
  };
}

export async function compareGovernmentSchemes(
  schemeId1: string = 'TN_PM_KUSUM_SOLAR_2026',
  schemeId2: string = 'NAT_PM_KISAN_2026'
): Promise<SchemeComparisonResult> {
  const allSchemes = await getActiveSchemes();
  const s1 = allSchemes.find((s) => s.scheme_id === schemeId1) || allSchemes[0];
  const s2 = allSchemes.find((s) => s.scheme_id === schemeId2) || allSchemes[1] || allSchemes[0];

  return {
    schemes: [s1, s2],
    comparison_matrix: [
      { field: 'Jurisdiction', scheme_1_value: s1.jurisdiction, scheme_2_value: s2.jurisdiction },
      { field: 'Benefit Value', scheme_1_value: s1.benefit_value, scheme_2_value: s2.benefit_value },
      { field: 'Target Beneficiaries', scheme_1_value: s1.target_beneficiaries.join(', '), scheme_2_value: s2.target_beneficiaries.join(', ') },
      { field: 'Application Channel', scheme_1_value: s1.application_method, scheme_2_value: s2.application_method },
      { field: 'Application Window', scheme_1_value: s1.application_window, scheme_2_value: s2.application_window }
    ],
    disclaimer: 'Comparison matrix presents factual scheme parameter comparisons for decision support. AgriMark does not declare any scheme universally superior.'
  };
}
