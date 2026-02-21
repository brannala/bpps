import { siteMismatchProb, pairwiseDistance, avgDistance, maxDistance, priorFromSeqs } from '../PriorFunc';

// --- siteMismatchProb ---

it('returns 0 for identical standard bases', () => {
    expect(siteMismatchProb('A', 'A')).toBe(0.0);
    expect(siteMismatchProb('t', 't')).toBe(0.0);
});

it('returns 1 for different standard bases', () => {
    expect(siteMismatchProb('A', 'C')).toBe(1.0);
    expect(siteMismatchProb('G', 'T')).toBe(1.0);
});

it('returns -1 for missing data characters', () => {
    expect(siteMismatchProb('A', '-')).toBe(-1);
    expect(siteMismatchProb('?', 'C')).toBe(-1);
    expect(siteMismatchProb('N', 'G')).toBe(-1);
});

it('normalizes U to T', () => {
    expect(siteMismatchProb('U', 'U')).toBe(0.0);
    expect(siteMismatchProb('U', 'A')).toBe(1.0);
});

it('handles IUPAC ambiguity codes', () => {
    // R = A or G, so A vs R = 0.5
    expect(siteMismatchProb('A', 'R')).toBe(0.5);
    // Y = C or T, so C vs Y = 0.5
    expect(siteMismatchProb('C', 'Y')).toBe(0.5);
});

// --- pairwiseDistance ---

it('returns 0 for identical sequences', () => {
    expect(pairwiseDistance('AATTCC', 'AATTCC')).toBe(0.0);
});

it('calculates distance for sequences differing at one site', () => {
    // 1 mismatch out of 6 sites = 1/6
    expect(pairwiseDistance('AATTCC', 'AATTCG')).toBeCloseTo(1/6, 10);
});

it('skips missing-data sites in distance calculation', () => {
    // 1 mismatch out of 5 non-missing sites = 0.2
    expect(pairwiseDistance('AATTC-', 'GATTC-')).toBeCloseTo(1/5, 10);
});

// --- avgDistance ---

it('returns 0 for a single sequence', () => {
    expect(avgDistance(['AATTCC'])).toBe(0);
});

it('returns 0 for identical sequences', () => {
    expect(avgDistance(['AATTCC', 'AATTCC'])).toBe(0.0);
});

it('calculates average distance for 3 sequences', () => {
    // pairs: AB=1/6, AC=2/6, BC=1/6 => avg = 2*(1/6+2/6+1/6)/(3*2)
    const seqs = ['AATTCC', 'AATTCG', 'AATTGG'];
    const result = avgDistance(seqs);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
});

// --- maxDistance ---

it('returns 0 for a single sequence per locus', () => {
    const sequences = [[['AATTCC']]];
    expect(maxDistance(sequences)).toBe(0);
});

it('finds maximum distance across loci', () => {
    // locus 0: identical seqs (dist=0), locus 1: different seqs (dist>0)
    const sequences = [
        [['AATTCC', 'AATTCC']],
        [['AATTCC', 'GGCCTT']]
    ];
    const result = maxDistance(sequences);
    expect(result).toBeGreaterThan(0);
});

// --- priorFromSeqs ---

it('returns prior with positive b values for divergent sequences', () => {
    const sequences = [
        [['AATTCCGG', 'AATTCCGA'], ['GGCCTTAA', 'GGCCTTAG']],
        [['AATTCCGG', 'AATTCCGT'], ['GGCCTTAA', 'GGCCTTAC']]
    ];
    const result = priorFromSeqs(sequences);
    expect(result.priorTheta.a).toBe(3.0);
    expect(result.priorTheta.b).toBeGreaterThan(0);
    expect(result.priorTau.a).toBe(3.0);
    expect(result.priorTau.b).toBeGreaterThan(0);
});

it('handles single-sample species (falls back to between-species variance)', () => {
    // Each species has only 1 sequence per locus, so within-species theta = 0
    const sequences = [
        [['AATTCCGG'], ['GGCCTTAA']],
        [['AATTCCGA'], ['GGCCTTAG']]
    ];
    const result = priorFromSeqs(sequences);
    expect(result.priorTheta.a).toBe(3.0);
    expect(result.priorTheta.b).toBeGreaterThanOrEqual(0);
    expect(result.priorTau.a).toBe(3.0);
    expect(result.priorTau.b).toBeGreaterThan(0);
});
