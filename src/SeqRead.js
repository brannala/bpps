// parses text in bpp format to create sequenceData object
// Supports multi-line (wrapped) sequences where continuation lines start with whitespace

function SeqRead(input) {

    const sequenceData = [];
    let locusNo = 0;

    const errorResult = (err) => { return { sequenceData: [], error: `error: unexpected input: ${err}` }; };

    // check for correct number of sites in each sequence
    function checkSequences(sData) {
        for(let loci of sData)
            for(let seqs of loci.sequences)
                if(Number(loci.nosites) !== seqs.seq.length)
                    return {error: true, error_message: `expected ${loci.nosites} sites in sequence ${seqs.seqname} but observed ${seqs.seq.length} sites`};
        return {error: false};
    }

    // Split input into lines
    const lines = input.split(/\r?\n/);
    let lineIdx = 0;

    // Skip empty lines at start
    while (lineIdx < lines.length && lines[lineIdx].trim() === '') {
        lineIdx++;
    }

    while (lineIdx < lines.length) {
        // Skip empty lines
        while (lineIdx < lines.length && lines[lineIdx].trim() === '') {
            lineIdx++;
        }
        if (lineIdx >= lines.length) break;

        // Read header line: noseqs nosites
        const headerLine = lines[lineIdx].trim();
        const headerMatch = headerLine.match(/^(\d+)\s+(\d+)$/);
        if (!headerMatch) {
            return errorResult(`missing number of sequences (or sites) at locus ${locusNo+1}, found: "${headerLine}"`);
        }
        const noseqs = parseInt(headerMatch[1], 10);
        const nosites = parseInt(headerMatch[2], 10);
        lineIdx++;

        sequenceData.push({noseqs: noseqs.toString(), nosites: nosites.toString(), sequences: []});

        // Read each sequence (may span multiple lines)
        for (let i = 0; i < noseqs; i++) {
            // Skip empty lines
            while (lineIdx < lines.length && lines[lineIdx].trim() === '') {
                lineIdx++;
            }
            if (lineIdx >= lines.length) {
                return errorResult(`missing sequence ${i+1} at locus ${locusNo+1}`);
            }

            // First line of sequence: name followed by sequence data
            const firstLine = lines[lineIdx];
            // Sequence name is the first non-whitespace token
            const nameMatch = firstLine.match(/^\s*(\S+)\s*(.*)/);
            if (!nameMatch) {
                return errorResult(`unexpected input at locus ${locusNo+1}, line: "${firstLine}"`);
            }
            const seqname = nameMatch[1];
            // Check that name doesn't start with a digit (would indicate we hit next locus header)
            if (/^\d+$/.test(seqname)) {
                return errorResult(`unexpected input at locus ${locusNo+1} near ${seqname}`);
            }

            let seqData = nameMatch[2].replace(/\s/g, ''); // First line's sequence data
            lineIdx++;

            // Read continuation lines (lines that start with whitespace and don't look like a new sequence or header)
            while (lineIdx < lines.length) {
                const nextLine = lines[lineIdx];
                // Empty line ends this sequence
                if (nextLine.trim() === '') break;
                // Line starting with non-whitespace is a new sequence name or next locus
                if (!/^\s/.test(nextLine)) break;
                // It's a continuation line - append sequence data
                seqData += nextLine.replace(/\s/g, '');
                lineIdx++;
            }

            // Validate sequence data doesn't contain numbers
            if (/\d/.test(seqData)) {
                return errorResult(`sequence ${i+1} at locus ${locusNo+1} contains a number!`);
            }

            sequenceData[locusNo].sequences.push({seqname: seqname, seq: seqData});
        }
        locusNo++;
    }

    let checkResult = checkSequences(sequenceData);
    if(checkResult.error)
        return errorResult(checkResult.error_message);
    else
        return {sequenceData: sequenceData, error: null};
}

export default SeqRead;
