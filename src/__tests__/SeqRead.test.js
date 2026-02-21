import SeqRead from '../SeqRead';

it('parses a single locus with 3 sequences', () => {
    const input = '3 6\nseqA  AATTCC\nseqB  AATTCG\nseqC  AATTGG';
    const result = SeqRead(input);
    expect(result.error).toBeNull();
    expect(result.sequenceData.length).toBe(1);
    expect(result.sequenceData[0].noseqs).toBe('3');
    expect(result.sequenceData[0].nosites).toBe('6');
    expect(result.sequenceData[0].sequences[0]).toEqual({seqname: 'seqA', seq: 'AATTCC'});
    expect(result.sequenceData[0].sequences[2]).toEqual({seqname: 'seqC', seq: 'AATTGG'});
});

it('parses two loci', () => {
    const input = '2 4\nseqA  AATT\nseqB  CCGG\n\n2 4\nseqC  TTAA\nseqD  GGCC';
    const result = SeqRead(input);
    expect(result.error).toBeNull();
    expect(result.sequenceData.length).toBe(2);
    expect(result.sequenceData[1].sequences[0]).toEqual({seqname: 'seqC', seq: 'TTAA'});
});

it('handles wrapped (multi-line) sequences', () => {
    const input = '1 8\nseqA  AATT\n      CCGG';
    const result = SeqRead(input);
    expect(result.error).toBeNull();
    expect(result.sequenceData[0].sequences[0].seq).toBe('AATTCCGG');
});

it('returns error when site count does not match', () => {
    const input = '1 10\nseqA  AATTCC';
    const result = SeqRead(input);
    expect(result.error).not.toBeNull();
    expect(result.error).toContain('expected 10 sites');
});

it('returns error when a sequence is missing', () => {
    const input = '3 4\nseqA  AATT\nseqB  CCGG';
    const result = SeqRead(input);
    expect(result.error).not.toBeNull();
    expect(result.error).toContain('missing sequence');
});

it('returns error when header is malformed', () => {
    const input = 'notanumber 6\nseqA  AATTCC';
    const result = SeqRead(input);
    expect(result.error).not.toBeNull();
});

it('skips leading blank lines', () => {
    const input = '\n\n2 4\nseqA  AATT\nseqB  CCGG';
    const result = SeqRead(input);
    expect(result.error).toBeNull();
    expect(result.sequenceData.length).toBe(1);
    expect(result.sequenceData[0].sequences.length).toBe(2);
});
