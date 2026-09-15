import { NextResponse } from 'next/server';
import { queryKnowledgeGraph } from '@/lib/knowledge-graph-engine';
import {
  getCropKnowledgeProfile,
  getDiseaseKnowledgeProfile,
  getSoilKnowledgeProfile
} from '@/lib/crop-disease-soil-knowledge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || 'Turmeric';
  const disease = searchParams.get('disease') || 'Rhizome Rot';

  const graph = await queryKnowledgeGraph(crop);
  const cropProfile = await getCropKnowledgeProfile(crop);
  const diseaseProfile = await getDiseaseKnowledgeProfile(disease);
  const soilProfile = await getSoilKnowledgeProfile('Red Sandy Loam');

  return NextResponse.json({
    success: true,
    data: {
      knowledge_graph: graph,
      crop_profile: cropProfile,
      disease_profile: diseaseProfile,
      soil_profile: soilProfile
    }
  });
}



