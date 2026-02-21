import { ParseMapText, getSpeciesList, validateMapAgainstSequences } from '../CtrlFunc';

// --- ParseMapText ---

it('parses a valid map file', () => {
    const text = 'specimen1  speciesA\nspecimen2  speciesA\nspecimen3  speciesB';
    const result = ParseMapText(text);
    expect(result.error).toBeNull();
    expect(result.data.size).toBe(3);
    expect(result.data.get('specimen1')).toBe('speciesA');
    expect(result.data.get('specimen3')).toBe('speciesB');
});

it('skips comment lines and blank lines', () => {
    const text = '# this is a comment\nspecimen1  speciesA\n\nspecimen2  speciesB';
    const result = ParseMapText(text);
    expect(result.error).toBeNull();
    expect(result.data.size).toBe(2);
});

it('returns error for empty input', () => {
    const result = ParseMapText('   ');
    expect(result.error).not.toBeNull();
    expect(result.error).toContain('Empty');
});

it('returns error for line with only one column', () => {
    const text = 'specimen1  speciesA\norphan';
    const result = ParseMapText(text);
    expect(result.error).not.toBeNull();
    expect(result.error).toContain('Expected');
});

it('returns error for line with more than two columns', () => {
    const text = 'specimen1  species  extra';
    const result = ParseMapText(text);
    expect(result.error).not.toBeNull();
    expect(result.error).toContain('2 columns');
});

it('returns error for duplicate specimen names', () => {
    const text = 'specimen1  speciesA\nspecimen1  speciesB';
    const result = ParseMapText(text);
    expect(result.error).not.toBeNull();
    expect(result.error).toContain('Duplicate');
});

// --- getSpeciesList ---

it('extracts unique species in insertion order', () => {
    let mapData = new Map();
    mapData.set('s1', 'spA');
    mapData.set('s2', 'spB');
    mapData.set('s3', 'spA');
    mapData.set('s4', 'spC');
    expect(getSpeciesList(mapData)).toEqual(['spA', 'spB', 'spC']);
});

// --- validateMapAgainstSequences ---

it('validates when map matches sequences', () => {
    let mapData = new Map();
    mapData.set('s1', 'spA');
    mapData.set('s2', 'spB');

    const sequenceData = [
        { noseqs: 2, nosites: 4, sequences: [
            {seqname: 's1', seq: 'AATT'},
            {seqname: 's2', seq: 'CCGG'}
        ]}
    ];

    const result = validateMapAgainstSequences(mapData, sequenceData);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.matchedCount).toBe(2);
});

it('reports errors for specimens in map but not in sequences', () => {
    let mapData = new Map();
    mapData.set('s1', 'spA');
    mapData.set('missing', 'spB');

    const sequenceData = [
        { noseqs: 1, nosites: 4, sequences: [
            {seqname: 's1', seq: 'AATT'}
        ]}
    ];

    const result = validateMapAgainstSequences(mapData, sequenceData);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('missing');
});

it('reports warnings for specimens in sequences but not in map', () => {
    let mapData = new Map();
    mapData.set('s1', 'spA');

    const sequenceData = [
        { noseqs: 2, nosites: 4, sequences: [
            {seqname: 's1', seq: 'AATT'},
            {seqname: 'extra', seq: 'CCGG'}
        ]}
    ];

    const result = validateMapAgainstSequences(mapData, sequenceData);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('extra');
});
