import { uniqueSeqNames, seqToSpecName, createMapFileText, guessSpeciesFromPrefix } from '../MapFunctions';

// --- shared fixture ---

const sequenceData = [
    { noseqs: 3, nosites: 6, sequences: [
        {seqname: 'spA^s1', seq: 'AATTCC'},
        {seqname: 'spA^s2', seq: 'AATTCG'},
        {seqname: 'spB^s3', seq: 'GGCCTT'}
    ]},
    { noseqs: 2, nosites: 6, sequences: [
        {seqname: 'spA^s1', seq: 'AATTCC'},
        {seqname: 'spB^s4', seq: 'GGCCAA'}
    ]}
];

// --- uniqueSeqNames ---

it('returns unique sequence names across loci', () => {
    const names = uniqueSeqNames(sequenceData);
    expect(names.length).toBe(4);
    expect(names).toContain('spA^s1');
    expect(names).toContain('spB^s4');
});

it('returns empty array for empty sequenceData', () => {
    expect(uniqueSeqNames([])).toEqual([]);
});

// --- seqToSpecName ---

it('groups sequences by regex patterns', () => {
    const names = uniqueSeqNames(sequenceData);
    const filters = [
        { spName: 'spA', reg_exp: /^spA\^/ },
        { spName: 'spB', reg_exp: /^spB\^/ }
    ];
    const result = seqToSpecName(names, filters);
    expect(result.matchedSeqs.length).toBe(2);
    expect(result.matchedSeqs[0].spName).toBe('spA');
    expect(result.matchedSeqs[0].seqNames.length).toBe(2);
    expect(result.matchedSeqs[1].spName).toBe('spB');
    expect(result.matchedSeqs[1].seqNames.length).toBe(2);
    expect(result.unmatchedSeqs.length).toBe(0);
});

it('places unmatched sequences in unmatchedSeqs', () => {
    const names = ['spA^s1', 'spC^s5'];
    const filters = [{ spName: 'spA', reg_exp: /^spA\^/ }];
    const result = seqToSpecName(names, filters);
    expect(result.unmatchedSeqs).toEqual(['spC^s5']);
});

// --- createMapFileText ---

it('creates map file text from matched sequences', () => {
    const seqMatches = {
        matchedSeqs: [
            { seqNames: ['spA^s1', 'spA^s2'], spName: 'spA' },
            { seqNames: ['spB^s3'], spName: 'spB' }
        ]
    };
    const result = createMapFileText(seqMatches);
    expect(result.error).toBeNull();
    expect(result.text).toContain('s1  spA');
    expect(result.text).toContain('s2  spA');
    expect(result.text).toContain('s3  spB');
});

it('handles simple format (no caret in names)', () => {
    const seqMatches = {
        matchedSeqs: [
            { seqNames: ['seqA', 'seqB'], spName: 'speciesX' }
        ]
    };
    const result = createMapFileText(seqMatches);
    expect(result.error).toBeNull();
    expect(result.text).toContain('seqA  speciesX');
    expect(result.text).toContain('seqB  speciesX');
});

it('returns empty text for no matches', () => {
    const seqMatches = { matchedSeqs: [] };
    const result = createMapFileText(seqMatches);
    expect(result.error).toBeNull();
    expect(result.text).toBe('');
});

// --- guessSpeciesFromPrefix ---

it('detects species prefixes from caret-separated names', () => {
    const filters = guessSpeciesFromPrefix(sequenceData);
    const speciesNames = filters.map(f => f.spName).sort();
    expect(speciesNames).toEqual(['spA', 'spB']);
    expect(filters[0].reg_exp).toBeInstanceOf(RegExp);
});

it('returns empty array when no caret in names', () => {
    const data = [{ noseqs: 1, nosites: 4, sequences: [{seqname: 'noprefix', seq: 'AATT'}] }];
    expect(guessSpeciesFromPrefix(data)).toEqual([]);
});
