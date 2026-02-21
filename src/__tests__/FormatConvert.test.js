import { detectFormat, convertToBpp } from '../FormatConvert';

// --- detectFormat ---

it('detects FASTA format', () => {
    expect(detectFormat('>seq1\nAATTCC')).toBe('fasta');
});

it('detects NEXUS format (case-insensitive)', () => {
    expect(detectFormat('#NEXUS\nBEGIN DATA;')).toBe('nexus');
    expect(detectFormat('#nexus\nBEGIN DATA;')).toBe('nexus');
});

it('detects BPP/PHYLIP format', () => {
    expect(detectFormat('3 6\nseqA  AATTCC')).toBe('bpp');
});

it('returns unknown for unrecognized format', () => {
    expect(detectFormat('just some random text')).toBe('unknown');
});

// --- convertToBpp from FASTA ---

it('converts FASTA to BPP format', () => {
    const fasta = '>seqA\nAATTCC\n>seqB\nAATTCG';
    const result = convertToBpp(fasta, 'fasta');
    expect(result.converted).toBe(true);
    expect(result.text).toContain('2 6');
    expect(result.text).toContain('seqA');
    expect(result.text).toContain('AATTCC');
    expect(result.sequences.length).toBe(2);
});

// --- convertToBpp from NEXUS ---

it('converts NEXUS to BPP format', () => {
    const nexus = '#NEXUS\nBEGIN DATA;\nMATRIX\nseqA AATTCC\nseqB AATTCG\n;\nEND;';
    const result = convertToBpp(nexus, 'nexus');
    expect(result.converted).toBe(true);
    expect(result.text).toContain('2 6');
    expect(result.sequences.length).toBe(2);
});

// --- convertToBpp with already-BPP ---

it('returns input unchanged for bpp format', () => {
    const bpp = '2 6\nseqA  AATTCC\nseqB  AATTCG';
    const result = convertToBpp(bpp, 'bpp');
    expect(result.converted).toBe(false);
    expect(result.text).toBe(bpp);
});

// --- error cases ---

it('returns error for unaligned FASTA sequences', () => {
    const fasta = '>seqA\nAATTCC\n>seqB\nAA';
    const result = convertToBpp(fasta, 'fasta');
    expect(result.error).toContain('different lengths');
});

it('returns error when no sequences found', () => {
    const result = convertToBpp('', 'fasta');
    expect(result.error).toContain('No sequences');
});

it('returns error for unknown format', () => {
    const result = convertToBpp('data', 'xyz');
    expect(result.error).toContain('Unknown format');
});
