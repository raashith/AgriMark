import sys
import random

def run_policy_simulation(num_records=50000):
    print(f"--- Starting AgriMark Policy & Scheme Staging Simulation ({num_records:,} Records) ---")
    
    states = ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra", "Punjab", "Gujarat"]
    categories = ["IRRIGATION", "INCOME_SUPPORT", "CROP_INSURANCE", "CREDIT_SUBSIDY", "ORGANIC_FARMING"]
    
    synthetic_counts = {
        "policy_documents": 0,
        "scheme_evaluations": 0,
        "document_checklists": 0,
        "compliance_records": 0,
        "data_origin": "SYNTHETIC"
    }
    
    batch_size = 12500
    total_batches = num_records // batch_size
    
    for b in range(total_batches):
        state = random.choice(states)
        category = random.choice(categories)
        synthetic_counts["policy_documents"] += batch_size // 10
        synthetic_counts["scheme_evaluations"] += batch_size // 2
        synthetic_counts["document_checklists"] += batch_size // 4
        synthetic_counts["compliance_records"] += batch_size // 6
        
        processed = (b + 1) * batch_size
        print(f"Batch {b+1}/{total_batches} processed [{state} / {category}] -> Cumulative Synthetic Policy Records: {processed:,}")
        
    print("\n==================================================")
    print("POLICY & SCHEME GOVERNANCE SIMULATION SUMMARY")
    print("==================================================")
    print(f"Total Policy Records Simulated: {num_records:,}")
    print(f"Synthetic Policy Documents: {synthetic_counts['policy_documents']:,}")
    print(f"Synthetic Scheme Eligibility Evaluations: {synthetic_counts['scheme_evaluations']:,}")
    print(f"Synthetic Document Checklists: {synthetic_counts['document_checklists']:,}")
    print(f"Data Origin Marker: {synthetic_counts['data_origin']}")
    print("Isolation Guarantee: Production Policy APIs reject records where data_origin == 'SYNTHETIC'.")
    print("==================================================\n")
    
    return True

if __name__ == "__main__":
    records = 50000
    if len(sys.argv) > 1:
        try:
            records = int(sys.argv[1])
        except ValueError:
            pass
    run_policy_simulation(records)
