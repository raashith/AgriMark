export type ClimateInvestmentType =
  | 'CLIMATE_RESILIENT_INFRASTRUCTURE'
  | 'WATER_SAVING_TECHNOLOGY'
  | 'RENEWABLE_ENERGY_TRANSITION'
  | 'RISK_MITIGATION_INSURANCE';

export interface ClimateInvestmentProposal {
  id: string;
  farm_id: string;
  investment_type: ClimateInvestmentType;
  title: string;
  estimated_cost_inr: number;
  expected_annual_benefit_inr: number;
  payback_period_years: number;
  risk_assessment: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    key_risks: string[];
  };
  assumptions: string[];
  evidence: string[];
  autonomous_approval_granted: false; // Decision-support only, no autonomous approval
  generated_at: string;
}

export async function generateClimateInvestmentAssessment(
  farmId: string,
  investmentType: ClimateInvestmentType = 'WATER_SAVING_TECHNOLOGY'
): Promise<ClimateInvestmentProposal[]> {
  const proposals: ClimateInvestmentProposal[] = [
    {
      id: `inv_${farmId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_1`,
      farm_id: farmId,
      investment_type: 'WATER_SAVING_TECHNOLOGY',
      title: 'Drip Micro-Irrigation with Automation Sensors',
      estimated_cost_inr: 65000,
      expected_annual_benefit_inr: 24000,
      payback_period_years: 2.7,
      risk_assessment: {
        risk_level: 'LOW',
        key_risks: ['Filter clogging due to hard water', 'Rodent damage to lateral pipes']
      },
      assumptions: [
        '50% subsidy available under PMKSY scheme',
        'Electricity cost savings of 350 kWh per year'
      ],
      evidence: [
        'Farm water stress index calculated at 0.38',
        'Nearby Salem cluster farms achieved 32% yield boost'
      ],
      autonomous_approval_granted: false,
      generated_at: new Date().toISOString()
    },
    {
      id: `inv_${farmId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2`,
      farm_id: farmId,
      investment_type: 'RENEWABLE_ENERGY_TRANSITION',
      title: '5 HP Solar Powered Submersible Pump',
      estimated_cost_inr: 140000,
      expected_annual_benefit_inr: 38000,
      payback_period_years: 3.7,
      risk_assessment: {
        risk_level: 'MEDIUM',
        key_risks: ['Monsoon cloud cover reducing daytime pumping capacity']
      },
      assumptions: [
        'KUSUM Scheme subsidy 60% applicable',
        'Zero grid electricity reliance during peak daytime'
      ],
      evidence: [
        'Solar irradiation in Salem district averages 5.4 kWh/m2/day',
        'Diesel pump replacement eliminates 1,200 kg CO2e per year'
      ],
      autonomous_approval_granted: false,
      generated_at: new Date().toISOString()
    }
  ];

  return proposals.filter((p) => p.investment_type === investmentType || investmentType === undefined);
}
