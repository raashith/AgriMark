from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.data_catalog_api import router as data_catalog_router
from backend.app.api.v1.data_contracts_api import router as data_contracts_router
from backend.app.api.v1.data_consent_api import router as data_consent_router
from backend.app.api.v1.data_lineage_api import router as data_lineage_router
from backend.app.api.v1.data_exchange_api import router as data_exchange_router
from backend.app.api.v1.data_sandbox_api import router as data_sandbox_router
from backend.app.api.v1.developer_portal_api import router as developer_portal_router
from backend.app.api.v1.sandbox_projects_api import router as sandbox_projects_router
from backend.app.api.v1.datasets_marketplace_api import router as datasets_marketplace_router
from backend.app.api.v1.experiments_benchmarks_api import router as experiments_benchmarks_router
from backend.app.api.v1.promotions_gate_api import router as promotions_gate_router
from backend.app.api.v1.farmer_outcomes_api import router as farmer_outcomes_router
from backend.app.api.v1.ai_impact_api import router as ai_impact_router
from backend.app.api.v1.stakeholder_economics_api import router as stakeholder_economics_router
from backend.app.api.v1.outcome_fairness_api import router as outcome_fairness_router
from backend.app.api.v1.seeds_api import router as seeds_router
from backend.app.api.v1.breeding_gxe_api import router as breeding_gxe_router
from backend.app.api.v1.bioinputs_api import router as bioinputs_router
from backend.app.api.v1.biology_research_api import router as biology_research_router
from backend.app.api.v1.logistics_processing_api import router as logistics_processing_router
from backend.app.api.v1.finance_allied_api import router as finance_allied_router
from backend.app.api.v1.trade_climate_resilience_api import router as trade_climate_resilience_router
from backend.app.api.v1.unified_os_api import router as unified_os_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(data_catalog_router)
api_v1_router.include_router(data_contracts_router)
api_v1_router.include_router(data_consent_router)
api_v1_router.include_router(data_lineage_router)
api_v1_router.include_router(data_exchange_router)
api_v1_router.include_router(data_sandbox_router)
api_v1_router.include_router(developer_portal_router)
api_v1_router.include_router(sandbox_projects_router)
api_v1_router.include_router(datasets_marketplace_router)
api_v1_router.include_router(experiments_benchmarks_router)
api_v1_router.include_router(promotions_gate_router)
api_v1_router.include_router(farmer_outcomes_router)
api_v1_router.include_router(ai_impact_router)
api_v1_router.include_router(stakeholder_economics_router)
api_v1_router.include_router(outcome_fairness_router)
api_v1_router.include_router(seeds_router)
api_v1_router.include_router(breeding_gxe_router)
api_v1_router.include_router(bioinputs_router)
api_v1_router.include_router(biology_research_router)
api_v1_router.include_router(logistics_processing_router)
api_v1_router.include_router(finance_allied_router)
api_v1_router.include_router(trade_climate_resilience_router)
api_v1_router.include_router(unified_os_router)





