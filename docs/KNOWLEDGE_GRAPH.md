# Agricultural Knowledge Graph Architecture

## 1. Overview
The **AgriMark Agricultural Knowledge Graph** forms the canonical semantic substrate connecting crops, varieties, soils, pests, diseases, practices, climate conditions, inputs, and research claims. 

AgriMark operates as an evidence-backed intelligence layer—not a scientific authority. Thus, every entity and relationship within the graph maintains explicit evidence provenance linking back to verified research papers, official extension guidance, or validated field trials.

---

## 2. Canonical Entities
The knowledge graph encapsulates 18 domain entity types stored in `agri_knowledge_entities`:

| Entity Type | Description |
|---|---|
| `crop` | Agronomic crops (e.g., Oryza sativa / Rice, Triticum aestivum / Wheat) |
| `variety` | Commercial or traditional crop varieties (e.g., Pusa Basmati 1121) |
| `cultivar` | Specific cultivated plant lineages with distinct phenological traits |
| `soil` | Soil classifications and types (e.g., Vertisol, Alfisol, Alluvial) |
| `nutrient` | Essential plant nutrients (e.g., Nitrogen, Phosphorus, Zinc, Boron) |
| `pest` | Agricultural pests and insects (e.g., Nilaparvata lugens / Brown Planthopper) |
| `disease` | Plant pathoses and physiological disorders (e.g., Bacterial Rice Blight) |
| `pathogen` | Etiological agents (e.g., Xanthomonas oryzae pv. oryzae) |
| `practice` | Cultural and agronomic practices (e.g., Alternate Wetting & Drying - AWD) |
| `input` | Agricultural inputs (e.g., Neem-coated Urea, Trichoderma harzianum) |
| `irrigation_method` | Water delivery systems (e.g., Drip irrigation, Sub-surface drip) |
| `climate_condition` | Agro-climatic zones and conditions (e.g., Semi-arid tropical) |
| `weather_event` | Extreme or stress weather events (e.g., Mid-season dry spell) |
| `farm_operation` | Discrete field activities (e.g., Deep summer plowing) |
| `processing_method` | Post-harvest processing techniques (e.g., Parboiling) |
| `storage_method` | Grain and produce preservation methods (e.g., Hermetic bag storage) |
| `market` | Agricultural trade centers and mandis |
| `research_question` | Formulated scientific inquiries undergoing investigation |

---

## 3. Grounded Relationships
Edges between entities are governed by 11 strictly typed relationships in `agri_knowledge_relationships`:

1. `CROP_REQUIRES_SOIL`: Links crop to suitable soil taxonomy.
2. `CROP_AFFECTED_BY_DISEASE`: Identifies diseases targeting specific crops.
3. `DISEASE_CAUSED_BY`: Maps disease to underlying biological pathogen.
4. `CROP_REQUIRES_NUTRIENT`: Specifies macro/micronutrient requirements across growth stages.
5. `PRACTICE_IMPROVES`: Links agronomic practices to positive outcomes (e.g., yield, water efficiency).
6. `PRACTICE_RISKS`: Documents potential negative side effects under specific conditions.
7. `VARIETY_SUITS`: Connects crop varieties to target regional or soil contexts.
8. `CROP_SUITS_CLIMATE`: Maps crop tolerance to agro-climatic boundaries.
9. `INPUT_USED_FOR`: Details pest/disease/nutrient intervention applications.
10. `RESEARCH_SUPPORTS`: Connects research papers directly to supported entity relationships.
11. `RESEARCH_CONTRADICTS`: Connects research papers directly to disputed entity relationships.

**Strict Invariant**: No edge exists without a mandatory foreign key reference to `knowledge_evidence` detailing source DOI/URL, methodology, and confidence score.

---

## 4. Graph Query Interface
The knowledge graph is queryable via `/api/v1/research/knowledge`:

```http
GET /api/v1/research/knowledge?entity_id=CR-RICE-001&depth=2
Authorization: Bearer <token>
```

Response:
```json
{
  "entity": {
    "id": "CR-RICE-001",
    "type": "crop",
    "name": "Rice (Oryza sativa)"
  },
  "relationships": [
    {
      "type": "CROP_AFFECTED_BY_DISEASE",
      "target_entity": "Bacterial Blight",
      "evidence": {
        "source": "ICAR-NRRI Research Bulletin",
        "doi": "10.56093/ijas.v95i6.148201",
        "evidence_level": "OFFICIAL_RESEARCH",
        "confidence": 0.95
      }
    }
  ]
}
```
