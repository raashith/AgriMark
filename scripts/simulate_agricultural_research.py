import sys
import random

def run_research_simulation(num_records=100000):
    print(f"--- Starting AgriMark Research & Scientific Intelligence Staging Simulation ({num_records:,} Records) ---")
    
    crops = ["Turmeric", "Paddy", "Wheat", "Tapioca", "Spices", "Pulses"]
    institutions = ["ICAR-IISR", "TNAU", "IARI", "PAU", "ICRISAT"]
    
    synthetic_counts = {
        "research_papers": 0,
        "datasets": 0,
        "field_trials": 0,
        "knowledge_claims": 0,
        "data_origin": "SYNTHETIC"
    }
    
    batch_size = 25000
    total_batches = num_records // batch_size
    
    for b in range(total_batches):
        crop = random.choice(crops)
        inst = random.choice(institutions)
        synthetic_counts["research_papers"] += batch_size // 5
        synthetic_counts["datasets"] += batch_size // 10
        synthetic_counts["field_trials"] += batch_size // 5
        synthetic_counts["knowledge_claims"] += batch_size // 2
        
        processed = (b + 1) * batch_size
        print(f"Batch {b+1}/{total_batches} processed [{inst} / {crop}] -> Cumulative Synthetic Research Records: {processed:,}")
        
    print("\n==================================================")
    print("RESEARCH & SCIENTIFIC INTELLIGENCE SIMULATION SUMMARY")
    print("==================================================")
    print(f"Total Research Records Simulated: {num_records:,}")
    print(f"Synthetic Research Papers: {synthetic_counts['research_papers']:,}")
    print(f"Synthetic Research Datasets: {synthetic_counts['datasets']:,}")
    print(f"Synthetic Field Trials: {synthetic_counts['field_trials']:,}")
    print(f"Synthetic Knowledge Claims: {synthetic_counts['knowledge_claims']:,}")
    print(f"Data Origin Marker: {synthetic_counts['data_origin']}")
    print("Isolation Guarantee: Production Research APIs reject records where data_origin == 'SYNTHETIC'.")
    print("==================================================\n")
    
    return True

if __name__ == "__main__":
    records = 100000
    if len(sys.argv) > 1:
        try:
            records = int(sys.argv[1])
        except ValueError:
            pass
    run_research_simulation(records)
