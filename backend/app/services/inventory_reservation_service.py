import uuid
import threading
from typing import Dict, Any, Optional
from datetime import datetime


class InventoryReservationService:
    """
    Service for Atomic Inventory Reservation preventing negative stock and race conditions.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._lots: Dict[str, Dict[str, Any]] = {
            "LOT-TOMATO-100": {
                "lot_code": "LOT-TOMATO-100",
                "crop_name": "Tomato",
                "total_quantity_kg": 100.0,
                "available_quantity_kg": 100.0,
                "reserved_quantity_kg": 0.0
            }
        }

    def reserve_inventory(self, lot_code: str, requested_kg: float) -> Dict[str, Any]:
        with self._lock:
            lot = self._lots.get(lot_code)
            if not lot:
                return {"success": False, "reason": "LOT_NOT_FOUND", "reserved_kg": 0.0}

            available = lot["available_quantity_kg"]
            if available <= 0:
                return {
                    "success": False,
                    "reason": "OUT_OF_STOCK",
                    "requested_kg": requested_kg,
                    "allocated_kg": 0.0,
                    "remaining_available_kg": 0.0
                }

            if requested_kg <= available:
                lot["available_quantity_kg"] -= requested_kg
                lot["reserved_quantity_kg"] += requested_kg
                return {
                    "success": True,
                    "reason": "FULL_RESERVATION_GRANTED",
                    "requested_kg": requested_kg,
                    "allocated_kg": requested_kg,
                    "remaining_available_kg": lot["available_quantity_kg"]
                }
            else:
                # Partial safe allocation without negative stock
                allocated = available
                lot["available_quantity_kg"] = 0.0
                lot["reserved_quantity_kg"] += allocated
                return {
                    "success": False,
                    "reason": "PARTIAL_RESERVATION_GRANTED",
                    "requested_kg": requested_kg,
                    "allocated_kg": allocated,
                    "remaining_available_kg": 0.0
                }

    def get_lot_status(self, lot_code: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self._lots.get(lot_code)
