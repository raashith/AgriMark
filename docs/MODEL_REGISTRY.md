# AgriMark Model Registry & Governance Framework

## Overview

The **Model Registry** (`web/src/lib/model-registry-governance.ts`, `/api/v1/models`) tracks ML model versions, evaluation metrics, production deployments, and rollback records.

---

## Model Governance Pipeline

```
[ TRAINING RUN ] ──► [ EVALUATION RUN ] ──► [ STAGING VERSION ]
                                                   │
                                                   ▼ (Admin Signoff)
[ ROLLBACK RECORD ] ◄── [ PRODUCTION DEPLOYMENT ]
```

### Registry Record Structure

```json
{
  "model_name": "matching_ranker",
  "version": "2.1.0",
  "dataset_version": "ds_turmeric_2026_v4",
  "features": ["fulfillment_history", "price_realization", "distance_km", "quality_grade"],
  "evaluation_metrics": {
    "accuracy": 0.952,
    "precision": 0.941,
    "recall": 0.938,
    "f1_score": 0.939
  },
  "approved_by": "admin_chief_data_officer",
  "status": "PRODUCTION"
}
```

### Rollback Capability
In the event of an anomalous performance drop in production, models can be rolled back immediately via `POST /api/v1/models` with `action: "rollback"`, restoring the previously approved stable model version.
