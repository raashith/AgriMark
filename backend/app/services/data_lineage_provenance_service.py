from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class DataLineageProvenanceService:
    """
    Manages DataLineageGraph and Provenance records for every agricultural data element,
    allowing forward lineage (Source -> Transform -> Model -> Action) and reverse lineage
    (Recommendation -> Dataset -> Provider -> Source).
    """
    def __init__(self):
        self._nodes: Dict[str, Dict[str, Any]] = {}
        self._edges: List[Dict[str, Any]] = []
        self._seed_sample_lineage()

    def _seed_sample_lineage(self):
        # Sample weather observation to advisory lineage
        n1 = self.record_node("w-obs-001", "Weather Observation", "SOURCE", {"provider": "IMD_WEATHER", "location": "Salem"})
        n2 = self.record_node("w-norm-001", "Normalized Weather", "DATASET", {"schema": "WeatherObservation"})
        n3 = self.record_node("c-feat-001", "Crop Stress Feature", "TRANSFORM", {"model": "HeatStressV1"})
        n4 = self.record_node("yield-mod-001", "Yield Prediction Model", "MODEL", {"version": "v2.1"})
        n5 = self.record_node("adv-001", "Irrigation Advisory", "ADVISORY", {"target": "farmer-123"})
        n6 = self.record_node("act-001", "Drip Controller Action", "ACTION", {"device": "drip-098"})

        self.connect_nodes(n1["id"], n2["id"], "INGESTION")
        self.connect_nodes(n2["id"], n3["id"], "FEATURE_EXTRACTION")
        self.connect_nodes(n3["id"], n4["id"], "INFERENCE_INPUT")
        self.connect_nodes(n4["id"], n5["id"], "GENERATION")
        self.connect_nodes(n5["id"], n6["id"], "EXECUTION")

    def record_node(self, node_code: str, name: str, node_type: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        node_id = str(uuid.uuid4())
        node_item = {
            "id": node_id,
            "node_code": node_code,
            "name": name,
            "node_type": node_type, # SOURCE, DATASET, TRANSFORM, MODEL, ADVISORY, ACTION
            "metadata_payload": metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        self._nodes[node_id] = node_item
        self._nodes[node_code] = node_item
        return node_item

    def connect_nodes(self, source_identifier: str, target_identifier: str, transformation_type: str = "DERIVATION") -> Dict[str, Any]:
        src = self._nodes.get(source_identifier)
        tgt = self._nodes.get(target_identifier)
        if not src or not tgt:
            raise ValueError("Source or Target node not found for lineage connection")

        edge_item = {
            "id": str(uuid.uuid4()),
            "source_node_id": src["id"],
            "target_node_id": tgt["id"],
            "transformation_type": transformation_type,
            "created_at": datetime.utcnow().isoformat()
        }
        self._edges.append(edge_item)
        return edge_item

    def get_forward_lineage(self, node_identifier: str) -> List[Dict[str, Any]]:
        start_node = self._nodes.get(node_identifier)
        if not start_node:
            return []

        visited = set()
        queue = [start_node["id"]]
        result = [start_node]

        while queue:
            curr_id = queue.pop(0)
            visited.add(curr_id)

            for edge in self._edges:
                if edge["source_node_id"] == curr_id and edge["target_node_id"] not in visited:
                    tgt_node = self._nodes[edge["target_node_id"]]
                    result.append(tgt_node)
                    queue.append(edge["target_node_id"])

        return result

    def get_reverse_lineage(self, node_identifier: str) -> List[Dict[str, Any]]:
        start_node = self._nodes.get(node_identifier)
        if not start_node:
            return []

        visited = set()
        queue = [start_node["id"]]
        result = [start_node]

        while queue:
            curr_id = queue.pop(0)
            visited.add(curr_id)

            for edge in self._edges:
                if edge["target_node_id"] == curr_id and edge["source_node_id"] not in visited:
                    src_node = self._nodes[edge["source_node_id"]]
                    result.append(src_node)
                    queue.append(edge["source_node_id"])

        return result
