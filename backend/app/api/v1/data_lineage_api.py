from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.app.services.data_lineage_provenance_service import DataLineageProvenanceService

router = APIRouter(prefix="/data/lineage", tags=["Data Lineage & Provenance"])

lineage_service = DataLineageProvenanceService()

@router.get("/forward/{node_identifier}")
def get_forward_lineage(node_identifier: str):
    nodes = lineage_service.get_forward_lineage(node_identifier)
    if not nodes:
        raise HTTPException(status_code=404, detail=f"Lineage node '{node_identifier}' not found")
    return {
        "root_identifier": node_identifier,
        "direction": "FORWARD",
        "nodes": nodes
    }

@router.get("/reverse/{node_identifier}")
def get_reverse_lineage(node_identifier: str):
    nodes = lineage_service.get_reverse_lineage(node_identifier)
    if not nodes:
        raise HTTPException(status_code=404, detail=f"Lineage node '{node_identifier}' not found")
    return {
        "root_identifier": node_identifier,
        "direction": "REVERSE",
        "nodes": nodes
    }
