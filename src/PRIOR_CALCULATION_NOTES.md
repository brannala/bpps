# Prior Parameter Calculation Notes

## Overview

The `priorFromSeqs` function in `PriorFunc.js` calculates prior parameters for θ (theta) and τ (tau) from sequence data.

## Theta (θ) Prior

### Primary Method: Within-Species Pairwise Distances

When multiple sequences per species are available:
- Calculate average pairwise distance within each species at each locus
- Average across all species and loci
- This directly estimates θ = 4Nμ (population mutation rate)

### Fallback Method: Between-Species Variance (Single Sample per Species)

When only one sequence per species is available (within-species θ = 0), we estimate ancestral θ from the variance of between-species distances across loci.

**Derivation:**

For two sequences from different species at a single locus:
- Total branch length = 2τ (divergence) + 2T (coalescent time in ancestor)
- Distance D = proportion of differing sites

The variance of D across loci has two components:

1. **Mutation variance**: Poisson stochasticity in mutation counts
   - For counts: Var(mutations) = E[mutations]
   - For proportions: Var(D_mut) = E[D] / L, where L = sequence length

2. **Coalescent variance**: Variation in coalescent time T across loci
   - T ~ Exponential with mean θ/2
   - Var(T) = (θ/2)² = θ²/4
   - Var(2T) = 4 × Var(T) = θ²

**Formula:**
```
Var(D) = Var(D_mut) + Var(D_coal)
       = mean(D)/L + θ²

Therefore:
θ² = Var(D) - mean(D)/L
θ  = sqrt(Var(D) - mean(D)/L)
```

**Implementation:**
1. For each species pair, collect pairwise distances across all loci
2. Compute mean and variance of distances for that pair
3. Compute coalescent variance: `coalVar = variance - mean/avgSeqLen`
4. Average coalescent variance across all species pairs
5. θ = sqrt(average coalescent variance)

**Fallback when coalescent variance ≤ 0:**
- Use `mean/10` as a conservative estimate
- This can happen with very short sequences or highly conserved data

## Tau (τ) Prior

The τ prior (root age / divergence time) is estimated as the **maximum pairwise distance** across all sequence pairs (both within and between species) across all loci.

This provides a conservative upper bound estimate for the deepest divergence.

## Inverse Gamma Parameters

Both priors use Inverse Gamma distributions with:
- Shape α = 3.0
- Scale β = mean × 2.0

This gives:
- Prior mean = β/(α-1) = mean × 2.0 / 2.0 = mean
- Prior SD = mean (coefficient of variation = 1)

The CV=1 provides a moderately diffuse prior centered on the data-derived estimate.

## Key Functions

- `pairwiseDistance(seq1, seq2)`: Returns proportion of differing sites, handling IUPAC ambiguity codes
- `avgDistance(sequences)`: Average pairwise distance within a set of sequences
- `coalescentVarianceFromBetweenSpecies(sequences)`: Estimates θ² from between-species variance
- `maxDistance(sequences)`: Maximum pairwise distance for τ estimation
- `priorFromSeqs(sequences)`: Main function returning `{priorTheta, priorTau}`

## Data Structure

Input `sequences` is organized as: `seqBySpec[locus][species][sequences]`
- Each locus contains an array of species
- Each species contains an array of sequence strings

## References

- Coalescent theory: E[T] = θ/2 for two sequences, Var(T) = (θ/2)²
- Poisson mutation model: Var(count) = E[count], Var(proportion) = E[proportion]/L
- Law of total variance: Var(D) = E[Var(D|T)] + Var(E[D|T])
