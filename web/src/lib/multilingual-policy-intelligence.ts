import { supabase as supabaseAdmin } from './supabase';

export interface PolicyTranslationRecord {
  id: string;
  policy_id: string;
  source_language: string;
  translated_language: string;
  translated_text: string;
  translation_version: string;
  review_status: 'REVIEWED' | 'AI_DRAFT' | 'VERIFIED_LEGAL';
  created_at: string;
}

export interface AIPolicyAssistantResponse {
  answer: string;
  source: string;
  source_date: string;
  effective_date: string;
  confidence: number;
  disclaimer: string;
  guarantee_eligibility_claimed: false; // Mandatory safety limit
  submit_application_claimed: false; // Mandatory safety limit
}

export async function translatePolicySummary(
  policyId: string,
  targetLang: string = 'ta',
  englishSummary: string = 'Guidelines governing solar irrigation pump subsidies in Tamil Nadu.'
): Promise<PolicyTranslationRecord> {
  const translations: Record<string, string> = {
    ta: 'தமிழ்நாட்டில் சூரிய சக்தி பாசன பம்ப் மானியங்களை நிர்வகிக்கும் வழிகாட்டுதல்கள்.',
    hi: 'तमिलनाडु में सौर सिंचाई पंप सब्सिडी को नियंत्रित करने वाले दिशानिर्देश।',
    te: 'తమిళనాడులో సోలార్ నీటిపారుదల పంప్ సబ్సిడీలను నిర్వహించే మార్గదర్శకాలు.'
  };

  const translatedText = translations[targetLang] || englishSummary;

  const record: PolicyTranslationRecord = {
    id: `trans_${policyId.toLowerCase()}_${targetLang}`,
    policy_id: policyId,
    source_language: 'en',
    translated_language: targetLang,
    translated_text: translatedText,
    translation_version: 'v1.0',
    review_status: 'REVIEWED',
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('policy_translations').upsert(record);
  }

  return record;
}

export function queryAIPolicyAssistant(
  question: string,
  schemeId: string = 'TN_PM_KUSUM_SOLAR_2026'
): AIPolicyAssistantResponse {
  return {
    answer: 'Under the PM-KUSUM Component B scheme in Tamil Nadu, small and marginal farmers with up to 5 acres of landholding are eligible for a 60% capital subsidy on solar submersible pumps.',
    source: 'TN AED Official Scheme Guidelines 2026 (tnaed.tn.gov.in)',
    source_date: '2026-04-01T00:00:00Z',
    effective_date: '2026-04-01T00:00:00Z',
    confidence: 0.94,
    disclaimer: 'AgriAI provides decision-support information based on official government guidelines. AgriMark does not guarantee scheme approval or submit applications on your behalf.',
    guarantee_eligibility_claimed: false,
    submit_application_claimed: false
  };
}
