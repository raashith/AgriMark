# Simulation Engine & Monte Carlo Framework

## 1. Engine Overview
The **AgriMark Simulation Engine** executes multi-run Monte Carlo simulations to quantify agricultural uncertainty under variable climate and market conditions.

---

## 2. Seed-Reproducible Monte Carlo
When a `random_seed` parameter is specified, the engine employs a deterministic pseudo-random number generator (Mulberry32 PRNG / Box-Muller transformation) to yield bit-reproducible yield loss distributions.

### Output Metrics:
- **P10 Value**: 10th percentile outcome (Pessimistic / Lower Bound).
- **P50 Value**: Median expected outcome.
- **P90 Value**: 90th percentile outcome (Optimistic / Upper Bound).
- **95% Confidence Interval**: Evaluated variance metrics.
