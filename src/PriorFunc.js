// Pre-computed distance lookup table (constant, created once)
const unphasedDistances = new Map();
unphasedDistances.set('aa',0.0);
unphasedDistances.set('ac',1.0);
unphasedDistances.set('ag',1.0);
unphasedDistances.set('at',1.0);
unphasedDistances.set('cc',0.0);
unphasedDistances.set('cg',1.0);
unphasedDistances.set('ct',1.0);
unphasedDistances.set('gg',0.0);
unphasedDistances.set('gt',1.0);
unphasedDistances.set('tt',0.0);

// Pre-computed missing data characters (constant, created once)
const MISSING_DATA = new Set(['-', '?', 'n']);
unphasedDistances.set('ar',0.500);
unphasedDistances.set('ay',1.0);
unphasedDistances.set('as',1.0);
unphasedDistances.set('aw',0.500);
unphasedDistances.set('ak',1.0);
unphasedDistances.set('am',0.500);
unphasedDistances.set('ab',1.0);
unphasedDistances.set('ad',0.333);
unphasedDistances.set('ah',0.333);
unphasedDistances.set('av',0.333);
unphasedDistances.set('cr',1.0);
unphasedDistances.set('cy',0.500);
unphasedDistances.set('cs',0.500);
unphasedDistances.set('cw',1.0);
unphasedDistances.set('ck',1.0);
unphasedDistances.set('cm',0.500);
unphasedDistances.set('bc',0.333);
unphasedDistances.set('cd',1.0);
unphasedDistances.set('ch',0.333);
unphasedDistances.set('cv',0.333);
unphasedDistances.set('gr',0.500);
unphasedDistances.set('gy',1.0);
unphasedDistances.set('gs',0.500);
unphasedDistances.set('gw',1.0);
unphasedDistances.set('gk',0.500);
unphasedDistances.set('gm',1.0);
unphasedDistances.set('bg',0.333);
unphasedDistances.set('dg',0.333);
unphasedDistances.set('gh',1.0);
unphasedDistances.set('gv',0.333);
unphasedDistances.set('rt',1.0);
unphasedDistances.set('ty',0.500);
unphasedDistances.set('st',1.0);
unphasedDistances.set('tw',0.500);
unphasedDistances.set('kt',0.500);
unphasedDistances.set('mt',1.0);
unphasedDistances.set('bt',0.333);
unphasedDistances.set('dt',0.333);
unphasedDistances.set('ht',0.333);
unphasedDistances.set('tv',1.0);
unphasedDistances.set('rr',0.500);
unphasedDistances.set('ry',1.0);
unphasedDistances.set('rs',0.250);
unphasedDistances.set('rw',0.250);
unphasedDistances.set('kr',0.250);
unphasedDistances.set('mr',0.250);
unphasedDistances.set('br',0.167);
unphasedDistances.set('dr',0.333);
unphasedDistances.set('hr',0.250);
unphasedDistances.set('rv',0.333);
unphasedDistances.set('yy',0.500);
unphasedDistances.set('sy',0.250);
unphasedDistances.set('wy',0.250);
unphasedDistances.set('ky',0.250);
unphasedDistances.set('my',0.250);
unphasedDistances.set('by',0.333);
unphasedDistances.set('dy',0.167);
unphasedDistances.set('hy',0.333);
unphasedDistances.set('vy',0.167);
unphasedDistances.set('ss',0.500);
unphasedDistances.set('sw',1.0);
unphasedDistances.set('ks',0.250);
unphasedDistances.set('ms',0.250);
unphasedDistances.set('bs',0.333);
unphasedDistances.set('ds',0.167);
unphasedDistances.set('hs',0.167);
unphasedDistances.set('sv',0.333);
unphasedDistances.set('ww',0.500);
unphasedDistances.set('kw',0.250);
unphasedDistances.set('mw',0.250);
unphasedDistances.set('bw',0.167);
unphasedDistances.set('dw',0.333);
unphasedDistances.set('hw',0.333);
unphasedDistances.set('vw',0.167);
unphasedDistances.set('kk',0.500);
unphasedDistances.set('km',1.0);
unphasedDistances.set('bk',0.333);
unphasedDistances.set('dk',0.333);
unphasedDistances.set('hk',0.167);
unphasedDistances.set('kv',0.167);
unphasedDistances.set('mm',0.500);
unphasedDistances.set('bm',0.167);
unphasedDistances.set('dm',0.167);
unphasedDistances.set('hm',0.333);
unphasedDistances.set('mv',0.333);
unphasedDistances.set('bb',0.333);
unphasedDistances.set('bd',0.222);
unphasedDistances.set('bh',0.222);
unphasedDistances.set('bv',0.222);
unphasedDistances.set('dd',0.333);
unphasedDistances.set('dh',0.222);
unphasedDistances.set('dv',0.222);
unphasedDistances.set('hh',0.333);
unphasedDistances.set('hv',0.222);
unphasedDistances.set('vv',0.333);


function isSpName(seqName,spName,mapData)
{
    if(mapData.get(seqName)===spName)
        return true;
    return false;
}

// gets the maximum number of sequences for each species at any locus
function getMaxNumberSeqs(spName,sequenceData,mapData)
{
    let seqMaxCount = 0;
    for(let locus of sequenceData)
    {
        let sequenceCount=0;
        for(let sequences of locus.sequences)
            if(isSpName(getSpecimen(sequences.seqname),spName,mapData))
                sequenceCount++;
        if(sequenceCount > seqMaxCount)
            seqMaxCount = sequenceCount;
    }
    return seqMaxCount;
}

// Computes max sequence counts for ALL species in a single pass (much faster than calling getMaxNumberSeqs per species)
function getAllMaxNumberSeqs(speciesList, sequenceData, mapData) {
    // Initialize counts for each species
    const maxCounts = new Map();
    for (const sp of speciesList) {
        maxCounts.set(sp, 0);
    }

    // Single pass through all loci
    for (const locus of sequenceData) {
        // Count sequences per species at this locus
        const locusCounts = new Map();
        for (const sp of speciesList) {
            locusCounts.set(sp, 0);
        }

        for (const seq of locus.sequences) {
            const specimen = getSpecimen(seq.seqname);
            const species = mapData.get(specimen);
            if (species && locusCounts.has(species)) {
                locusCounts.set(species, locusCounts.get(species) + 1);
            }
        }

        // Update max counts
        for (const sp of speciesList) {
            const count = locusCounts.get(sp);
            if (count > maxCounts.get(sp)) {
                maxCounts.set(sp, count);
            }
        }
    }

    return maxCounts;
}

function getSpecimen(seqName)
{
    return seqName.substr(seqName.indexOf('^')+1);
}

// collects sequences into seqBySpec[locus][species][seqs]
function getSeqBySpecies (sequenceData, speciesList, mapData) {
    const seqBySpec = [];
    const numLoci = sequenceData.length;

    // Pre-initialize array
    for(let i = 0; i < numLoci; i++)
        seqBySpec.push([]);

    // Create a Set of species for O(1) lookup
    const speciesSet = new Set(speciesList);

    for(let l = 0; l < numLoci; l++)
    {
        const locus = sequenceData[l];
        // Group sequences by species at this locus
        const speciesSeqs = new Map();

        for(let seq of locus.sequences)
        {
            const specimen = getSpecimen(seq.seqname);
            const species = mapData.get(specimen);

            if(species && speciesSet.has(species))
            {
                if(!speciesSeqs.has(species))
                    speciesSeqs.set(species, []);
                speciesSeqs.get(species).push(seq.seq);
            }
        }

        // Maintain species order from speciesList
        for(let species of speciesList)
        {
            const seqs = speciesSeqs.get(species);
            if(seqs && seqs.length > 0)
                seqBySpec[l].push(seqs);
        }
    }
    return seqBySpec;
}

function pairwiseDistance(seq1,seq2)
{
    let p2Dist = 0.0;
    let missing = 0;
    const len = seq1.length;

    // Use regular for loop (faster than for...in on strings)
    for(let i = 0; i < len; i++)
    {
        // Cache result to avoid calling siteMismatchProb twice
        const prob = siteMismatchProb(seq1[i], seq2[i]);
        if(prob === -1)
        {
            ++missing;
        }
        else
        {
            p2Dist += prob;
        }
    }
    return p2Dist / (len - missing);
}

function siteMismatchProb(site1,site2)
{
    let s1 = site1.toLowerCase();
    let s2 = site2.toLowerCase();

    // Check for missing data first (fast path)
    if(MISSING_DATA.has(s1) || MISSING_DATA.has(s2))
        return -1;

    // Normalize U to T
    if(s1 === 'u') s1 = 't';
    if(s2 === 'u') s2 = 't';

    // Create sorted duplet without array allocation
    const duplet_string = s1 <= s2 ? s1 + s2 : s2 + s1;
    return unphasedDistances.get(duplet_string);
}

// Maximum number of pairs to sample for distance calculations
const MAX_PAIRS_SAMPLE = 100;

function avgDistance(sequences)
{
    const n = sequences.length;
    if(n <= 1)
        return 0;

    const totalPairs = (n * (n - 1)) / 2;

    // For small datasets, compute all pairs
    if (totalPairs <= MAX_PAIRS_SAMPLE) {
        let sumDist = 0.0;
        for(let i = 0; i < n - 1; i++)
            for (let j = i + 1; j < n; j++)
                sumDist += pairwiseDistance(sequences[i], sequences[j]);
        return (2.0 * sumDist) / (n * (n - 1));
    }

    // For large datasets, sample random pairs
    let sumDist = 0.0;
    const sampled = new Set();
    let sampleCount = 0;

    while (sampleCount < MAX_PAIRS_SAMPLE) {
        const i = Math.floor(Math.random() * n);
        let j = Math.floor(Math.random() * n);
        if (i === j) continue;

        // Ensure i < j for consistent key
        const key = i < j ? `${i},${j}` : `${j},${i}`;
        if (sampled.has(key)) continue;

        sampled.add(key);
        const ii = i < j ? i : j;
        const jj = i < j ? j : i;
        sumDist += pairwiseDistance(sequences[ii], sequences[jj]);
        sampleCount++;
    }

    return sumDist / sampleCount;
}

function maxDistance(sequences)
{
    let maxDist = 0.0;

    for(let locus of sequences)
    {
        // Flatten all sequences at this locus
        const allSeqs = [];
        for(let seqs of locus)
        {
            for(let seq of seqs)
                allSeqs.push(seq);
        }

        const n = allSeqs.length;
        if (n < 2) continue;

        const totalPairs = (n * (n - 1)) / 2;

        // For small datasets, compute all pairs
        if (totalPairs <= MAX_PAIRS_SAMPLE) {
            for(let k = 0; k < n - 1; k++)
            {
                for(let j = k + 1; j < n; j++)
                {
                    const dist = pairwiseDistance(allSeqs[k], allSeqs[j]);
                    if(dist > maxDist)
                        maxDist = dist;
                }
            }
        } else {
            // For large datasets, sample random pairs to estimate max
            const sampled = new Set();
            let sampleCount = 0;

            while (sampleCount < MAX_PAIRS_SAMPLE) {
                const i = Math.floor(Math.random() * n);
                let j = Math.floor(Math.random() * n);
                if (i === j) continue;

                const key = i < j ? `${i},${j}` : `${j},${i}`;
                if (sampled.has(key)) continue;

                sampled.add(key);
                const ii = i < j ? i : j;
                const jj = i < j ? j : i;
                const dist = pairwiseDistance(allSeqs[ii], allSeqs[jj]);
                if (dist > maxDist)
                    maxDist = dist;
                sampleCount++;
            }
        }
    }
    return maxDist;
}

// Calculate coalescent variance from between-species pairwise distances
// For each species pair, compute variance across loci, then extract coalescent component
// Var(D) = Var(mut)/L + θ²  (for proportions, mutation variance = mean/L)
// So θ² = Var(D) - mean(D)/L
function coalescentVarianceFromBetweenSpecies(sequences)
{
    // Collect distances and sequence lengths for each species pair across loci
    // pairData[pairKey] = array of {dist, seqLen} across loci
    const pairData = new Map();

    for(let locus of sequences)
    {
        const numSpecies = locus.length;
        if (numSpecies < 2) continue;

        // For each pair of species at this locus
        for(let sp1 = 0; sp1 < numSpecies - 1; sp1++)
        {
            for(let sp2 = sp1 + 1; sp2 < numSpecies; sp2++)
            {
                const pairKey = `${sp1}_${sp2}`;
                const seqs1 = locus[sp1];
                const seqs2 = locus[sp2];

                // Get sequence length from first sequence at this locus
                const seqLen = seqs1[0].length;

                // Calculate average distance for this pair at this locus
                // (average over all sequence pairs within the species pair)
                let sumDist = 0;
                let count = 0;
                const pairsAtLocus = seqs1.length * seqs2.length;

                if (pairsAtLocus <= MAX_PAIRS_SAMPLE) {
                    for(let seq1 of seqs1)
                    {
                        for(let seq2 of seqs2)
                        {
                            sumDist += pairwiseDistance(seq1, seq2);
                            count++;
                        }
                    }
                } else {
                    // Sample random pairs for large datasets
                    while (count < MAX_PAIRS_SAMPLE) {
                        const i = Math.floor(Math.random() * seqs1.length);
                        const j = Math.floor(Math.random() * seqs2.length);
                        sumDist += pairwiseDistance(seqs1[i], seqs2[j]);
                        count++;
                    }
                }

                const avgDistAtLocus = count > 0 ? sumDist / count : 0;

                if (!pairData.has(pairKey)) {
                    pairData.set(pairKey, []);
                }
                pairData.get(pairKey).push({ dist: avgDistAtLocus, seqLen: seqLen });
            }
        }
    }

    // For each species pair, compute variance and mean across loci
    // Then extract coalescent variance: var - mean/avgSeqLen
    let totalCoalescentVar = 0;
    let totalMean = 0;
    let pairCount = 0;

    for (const [, data] of pairData) {
        if (data.length < 2) continue;

        const n = data.length;
        const distances = data.map(d => d.dist);
        const mean = distances.reduce((sum, d) => sum + d, 0) / n;
        const variance = distances.reduce((sum, d) => sum + (d - mean) * (d - mean), 0) / (n - 1);

        // Average sequence length for this pair across loci
        const avgSeqLen = data.reduce((sum, d) => sum + d.seqLen, 0) / n;

        // Coalescent variance = total variance - mutation variance
        // For proportions, mutation variance ≈ mean / seqLen
        const mutationVar = mean / avgSeqLen;
        const coalescentVar = variance - mutationVar;

        totalCoalescentVar += coalescentVar;
        totalMean += mean;
        pairCount++;
    }

    if (pairCount === 0) return { coalescentVariance: 0, mean: 0 };

    return {
        coalescentVariance: totalCoalescentVar / pairCount,
        mean: totalMean / pairCount
    };
}

function priorFromSeqs(sequences)
{
    let priorMeanTheta=0;
    let priorRootAge=0;
    let totalSpecies=0;
    for(let locus of sequences)
    {
        totalSpecies += locus.length;
        for(let species of locus)
            priorMeanTheta += avgDistance(species);
    }
    priorMeanTheta = priorMeanTheta/totalSpecies;

    // Fallback: if within-species theta is 0 (single samples per species),
    // estimate ancestral theta from coalescent variance in between-species distances
    if (priorMeanTheta === 0 || isNaN(priorMeanTheta)) {
        const { coalescentVariance, mean } = coalescentVarianceFromBetweenSpecies(sequences);
        // θ² ≈ coalescent variance, so θ ≈ sqrt(coalescent variance)
        if (coalescentVariance > 0) {
            priorMeanTheta = Math.sqrt(coalescentVariance);
        } else {
            // If coalescent variance is negligible, use fraction of mean distance
            priorMeanTheta = mean / 10.0;
        }
    }

    priorRootAge=maxDistance(sequences);
    const priorTheta = { a: 3.0, b: priorMeanTheta*2.0 }
    const priorTau = { a: 3.0, b:priorRootAge*2.0 }
    return { priorTheta: priorTheta, priorTau: priorTau };
}


export { getSeqBySpecies, pairwiseDistance, avgDistance, priorFromSeqs, maxDistance, getMaxNumberSeqs, getAllMaxNumberSeqs, siteMismatchProb }
