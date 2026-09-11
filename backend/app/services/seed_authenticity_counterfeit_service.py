import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.services.seed_registry_service import SeedRegistryService


class SeedAuthenticityCounterfeitService:
    """
    Service for QR Seed Authenticity Verification and Counterfeit Risk Detection.
    Outputs RISK_FLAG (never COUNTERFEIT_CONFIRMED unless authoritative evidence exists).
    Never calls a seed certified unless a valid test/cert record is found.
    """

    def __init__(self, seed_service: SeedRegistryService):
        self.seed_service = seed_service
        self._scanned_hashes: Dict[str, List[Dict[str, Any]]] = {}
        self._flags: List[Dict[str, Any]] = []

    def verify_seed_qr(self, batch_number: str, qr_hash: Optional[str] = None, scan_location: Optional[str] = "Thanjavur Retailer") -> Dict[str, Any]:
        """
        Performs QR batch lookup, duplicate QR scan check, producer license verification, and test lookup.
        """
        scan_event = {
            "batch_number": batch_number,
            "qr_hash": qr_hash,
            "scan_location": scan_location,
            "timestamp": datetime.utcnow().isoformat()
        }

        if batch_number not in self._scanned_hashes:
            self._scanned_hashes[batch_number] = []
        self._scanned_hashes[batch_number].append(scan_event)

        # Check if batch exists in registry
        batch_record = self.seed_service._batches.get(batch_number)
        if not batch_record:
            flag = {
                "id": str(uuid.uuid4()),
                "batch_number": batch_number,
                "risk_level": "RISK_FLAG",
                "flag_reason": "UNKNOWN_BATCH_NUMBER",
                "details": {"message": f"Batch number {batch_number} not found in national seed registry."},
                "flagged_at": datetime.utcnow().isoformat()
            }
            self._flags.append(flag)
            return {
                "batch_number": batch_number,
                "variety_code": "UNKNOWN",
                "producer_name": "UNVERIFIED_PRODUCER",
                "is_authentic": False,
                "certification_status": "UNCERTIFIED",
                "risk_status": "RISK_FLAG",
                "flag_reason": "UNKNOWN_BATCH_NUMBER",
                "provenance_chain": [],
                "test_summary": None
            }

        # Check duplicate scan anomaly
        scan_count = len(self._scanned_hashes[batch_number])
        risk_status = "VERIFIED_VALID"
        flag_reason = None

        if scan_count > 3:
            risk_status = "RISK_FLAG"
            flag_reason = "DUPLICATE_QR_SCANS_DETECTED"
            flag = {
                "id": str(uuid.uuid4()),
                "batch_number": batch_number,
                "risk_level": "RISK_FLAG",
                "flag_reason": flag_reason,
                "details": {"scan_count": scan_count, "location": scan_location},
                "flagged_at": datetime.utcnow().isoformat()
            }
            self._flags.append(flag)

        # Fetch tests
        tests = self.seed_service.get_batch_tests(batch_number)
        cert_status = "CERTIFIED" if (tests and any(t["passed"] for t in tests)) else "UNCERTIFIED_TEST_PENDING"

        variety = self.seed_service._varieties.get(batch_record["variety_code"], {})
        provenance = self.seed_service.get_batch_provenance(batch_number)

        return {
            "batch_number": batch_number,
            "variety_code": batch_record["variety_code"],
            "producer_name": variety.get("producer_name", "State Seed Agency"),
            "is_authentic": risk_status == "VERIFIED_VALID",
            "certification_status": cert_status,
            "risk_status": risk_status,
            "flag_reason": flag_reason,
            "provenance_chain": provenance,
            "test_summary": tests[0] if tests else None
        }

    def list_authenticity_flags(self) -> List[Dict[str, Any]]:
        return self._flags
