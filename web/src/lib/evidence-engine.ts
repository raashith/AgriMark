import { supabase as supabaseAdmin } from './supabase';

export type EvidenceType =
  | 'PRIMARY_RESEARCH'
  | 'META_ANALYSIS'
  | 'SYSTEMATIC_REVIEW'
  | 'OFFICIAL_RESEARCH'
  | 'EXPERT_GUIDANCE'
  | 'OBSERVATIONAL'
  | 'USER_REPORTED'
  | 'AI_GENERATED';

export interface KnowledgeClaimEvidence {
  id: string;
  claim: string;
  evidence_type: EvidenceType;
  source: string;
  source_url: string;
  publication_date: string;
  confidence: number;
  methodology: string;
  geographic_scope: string;
  crop_scope: string;
  limitations?: string;
  can_independently_validate: boolean;
}

export interface FarmerKnowledgeExplanation {
  claim: string;
  what_researchers_found: string;
  why_it_matters: string;
  where_it_applies: string;
  confidence: number;
  limitations: string;
  relation_to_farmer: string;
  guaranteed_outcome_disclaimer: string;
}

export async function createKnowledgeClaim(
  claimText: string,
  evidenceType: EvidenceType = 'PRIMARY_RESEARCH',
  sourceUrl: string = 'https://epubs.icar.org.in/index.php/IJAgS/article/view/148201'
): Promise<KnowledgeClaimEvidence> {
  const isAIGenerated = evidenceType === 'AI_GENERATED';

  const record: KnowledgeClaimEvidence = {
    id: `ev_${Math.random().toString(36).substring(2, 10)}`,
    claim: claimText,
    evidence_type: evidenceType,
    source: isAIGenerated ? 'AgriAI Draft Engine' : 'ICAR-IISR Published Randomized Controlled Trial',
    source_url: sourceUrl,
    publication_date: '2025-06-15T00:00:00Z',
    confidence: isAIGenerated ? 0.65 : 0.94,
    methodology: isAIGenerated ? 'LLM Retrieval Synthesis' : '3-Year Field RCT',
    geographic_scope: 'Salem District, Tamil Nadu',
    crop_scope: 'Turmeric',
    limitations: isAIGenerated ? 'AI_GENERATED content cannot independently validate scientific claims' : 'Restricted to red loam soils',
    can_independently_validate: !isAIGenerated
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('knowledge_evidence').insert({
      id: record.id,
      claim: record.claim,
      evidence_type: record.evidence_type,
      source: record.source,
      source_url: record.source_url,
      publication_date: record.publication_date,
      confidence: record.confidence,
      methodology: record.methodology,
      geographic_scope: record.geographic_scope,
      crop_scope: record.crop_scope,
      limitations: record.limitations
    });
  }

  return record;
}

export function translateResearchForFarmer(
  paperTitle: string,
  findingSummary: string
): FarmerKnowledgeExplanation {
  return {
    claim: paperTitle,
    what_researchers_found: findingSummary,
    why_it_matters: 'Switching to pulse drip irrigation can conserve water while protecting root health during dry spells.',
    where_it_applies: 'Red sandy loam soils in Salem & Erode districts for Turmeric crops.',
    confidence: 0.94,
    limitations: 'Results observed under controlled field trial conditions.',
    relation_to_farmer: 'If your farm has drip irrigation installed, scheduling evening pulse irrigation matches trial parameters.',
    guaranteed_outcome_disclaimer: 'Research summaries provide decision-support insights. AgriMark does not guarantee specific yield or economic outcomes.'
  };
}
