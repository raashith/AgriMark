import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class UnifiedEventBus:
    """
    Stage 30 Unified Idempotent Event Bus supporting replay and event publishing across all 24 standard events:
    FARM_CREATED, CROP_PLANTED, HARVEST_READY, PRODUCE_AVAILABLE, PRICE_CHANGED, WEATHER_ALERT,
    CLIMATE_RISK, MARKET_OPPORTUNITY, MATCH_FOUND, ORDER_CREATED, STORAGE_REQUIRED, COLD_CHAIN_ALERT,
    LOGISTICS_DELAY, PAYMENT_STATUS, INSURANCE_EVENT, PEST_ALERT, DISEASE_ALERT, QUALITY_RESULT,
    PROCESSING_CAPACITY, EXPORT_OPPORTUNITY, DISASTER_EVENT, AI_INCIDENT, OUTCOME_RECORDED.
    """

    def __init__(self):
        self._events: List[Dict[str, Any]] = []
        self._idempotency_keys: set = set()

    def publish_event(self, event_type: str, payload: Dict[str, Any], idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        key = idempotency_key or f"KEY-{event_type}-{payload.get('reference_id', uuid.uuid4().hex[:8])}"

        if key in self._idempotency_keys:
            # Idempotent skip - return existing record summary
            return {
                "event_status": "SKIPPED_DUPLICATE_IDEMPOTENT",
                "idempotency_key": key,
                "event_type": event_type
            }

        self._idempotency_keys.add(key)

        event_record = {
            "event_id": f"EVT-{uuid.uuid4().hex[:8].upper()}",
            "idempotency_key": key,
            "event_type": event_type,
            "payload": payload,
            "published_at": datetime.utcnow().isoformat()
        }
        self._events.append(event_record)
        return event_record

    def replay_events(self, event_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if event_type:
            return [e for e in self._events if e["event_type"] == event_type]
        return list(self._events)
