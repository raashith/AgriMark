from typing import Dict, Any, List, Callable, Optional
import uuid
from datetime import datetime

class AgriculturalEventBus:
    """
    AgriculturalEventBus: Handles versioned, idempotent, traceable events across AgriMark Data Commons.
    Supports event replay, subscriber notifications, and dead-letter queue handling.
    """
    ALLOWED_EVENTS = [
        "FARM_UPDATED", "CROP_UPDATED", "HARVEST_RECORDED", "PRICE_UPDATED",
        "MARKET_SHOCK", "WEATHER_ALERT", "PEST_ALERT", "POLICY_UPDATED",
        "SCHEME_UPDATED", "ORDER_CREATED", "SHIPMENT_UPDATED", "WAREHOUSE_UPDATED",
        "INSURANCE_EVENT", "FINANCE_EVENT", "EXECUTION_COMPLETED"
    ]

    def __init__(self):
        self._event_store: List[Dict[str, Any]] = []
        self._processed_ids: set = set()
        self._subscribers: Dict[str, List[Callable[[Dict[str, Any]], None]]] = {}
        self._dead_letter_queue: List[Dict[str, Any]] = []

    def subscribe(self, event_type: str, callback: Callable[[Dict[str, Any]], None]):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)

    def publish_event(self, event_type: str, payload: Dict[str, Any], source_system: str = "AgriMark", event_id: Optional[str] = None) -> Dict[str, Any]:
        if event_type not in self.ALLOWED_EVENTS:
            raise ValueError(f"Unknown event_type '{event_type}'. Allowed: {self.ALLOWED_EVENTS}")

        e_id = event_id or str(uuid.uuid4())
        # Idempotency check
        if e_id in self._processed_ids:
            return {
                "event_id": e_id,
                "status": "DUPLICATE_IGNORED",
                "message": f"Event '{e_id}' was already processed (Idempotency protection)."
            }

        self._processed_ids.add(e_id)
        event_record = {
            "event_id": e_id,
            "event_type": event_type,
            "version": "1.0.0",
            "source_system": source_system,
            "payload": payload,
            "timestamp": datetime.utcnow().isoformat()
        }
        self._event_store.append(event_record)

        # Notify subscribers
        subscribers = self._subscribers.get(event_type, [])
        for sub in subscribers:
            try:
                sub(event_record)
            except Exception as ex:
                self._dead_letter_queue.append({
                    "event": event_record,
                    "error": str(ex),
                    "failed_at": datetime.utcnow().isoformat()
                })

        return {
            "event_id": e_id,
            "status": "PUBLISHED",
            "subscribers_notified": len(subscribers)
        }

    def replay_events(self, from_timestamp: Optional[str] = None, event_type: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered = self._event_store
        if event_type:
            filtered = [e for e in filtered if e["event_type"] == event_type]
        if from_timestamp:
            filtered = [e for e in filtered if e["timestamp"] >= from_timestamp]
        return filtered

    def get_dead_letters(self) -> List[Dict[str, Any]]:
        return self._dead_letter_queue
