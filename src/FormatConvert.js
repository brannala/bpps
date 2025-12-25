// Format detection and conversion functions for sequence files

// Detect the format of a sequence file
function detectFormat(text) {
    const trimmed = text.trim();

    // Check for FASTA format (starts with >)
    if (trimmed.startsWith('>')) {
        return 'fasta';
    }

    // Check for NEXUS format (starts with #NEXUS)
    if (trimmed.toUpperCase().startsWith('#NEXUS')) {
        return 'nexus';
    }

    // Check for PHYLIP/BPP format (starts with two numbers)
    const firstLine = trimmed.split(/\r?\n/)[0].trim();
    const parts = firstLine.split(/\s+/);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return 'bpp'; // PHYLIP and BPP have similar format
    }

    return 'unknown';
}

// Parse FASTA format and return array of {name, sequence} objects
function parseFasta(text) {
    const sequences = [];
    const lines = text.trim().split(/\r?\n/);
    let currentName = '';
    let currentSeq = '';

    for (const line of lines) {
        if (line.startsWith('>')) {
            if (currentName) {
                sequences.push({ name: currentName, seq: currentSeq });
            }
            currentName = line.substring(1).trim().split(/\s+/)[0]; // Take first word as name
            currentSeq = '';
        } else {
            currentSeq += line.trim().replace(/\s/g, '');
        }
    }

    // Don't forget the last sequence
    if (currentName) {
        sequences.push({ name: currentName, seq: currentSeq });
    }

    return sequences;
}

// Parse NEXUS format (simplified - handles basic DATA block)
function parseNexus(text) {
    const sequences = [];
    const lines = text.trim().split(/\r?\n/);

    let inMatrix = false;
    let seqData = {};

    for (let line of lines) {
        line = line.trim();

        // Look for MATRIX keyword
        if (line.toUpperCase().startsWith('MATRIX')) {
            inMatrix = true;
            continue;
        }

        // End of matrix
        if (inMatrix && line === ';') {
            inMatrix = false;
            continue;
        }

        // Parse sequence lines in matrix
        if (inMatrix && line && !line.startsWith('[')) {
            const parts = line.replace(/;$/, '').split(/\s+/);
            if (parts.length >= 2) {
                const name = parts[0];
                const seq = parts.slice(1).join('').replace(/\s/g, '');
                if (seqData[name]) {
                    seqData[name] += seq;
                } else {
                    seqData[name] = seq;
                }
            }
        }
    }

    // Convert to array format
    for (const name in seqData) {
        sequences.push({ name: name, seq: seqData[name] });
    }

    return sequences;
}

// Convert sequences array to BPP format string
function toBppFormat(sequences) {
    if (sequences.length === 0) return '';

    const nseqs = sequences.length;
    const nsites = sequences[0].seq.length;

    // Find longest name for padding
    const maxNameLen = Math.max(...sequences.map(s => s.name.length));

    let result = `${nseqs} ${nsites}\n`;

    for (const seq of sequences) {
        const paddedName = seq.name.padEnd(maxNameLen, ' ');
        result += `${paddedName}  ${seq.seq}\n`;
    }

    return result.trim();
}

// Main conversion function - converts any supported format to BPP
function convertToBpp(text, format) {
    let sequences = [];

    switch (format) {
        case 'fasta':
            sequences = parseFasta(text);
            break;
        case 'nexus':
            sequences = parseNexus(text);
            break;
        case 'bpp':
            return { converted: false, text: text }; // Already BPP format
        default:
            return { error: 'Unknown format' };
    }

    if (sequences.length === 0) {
        return { error: 'No sequences found in file' };
    }

    // Validate all sequences have same length
    const lengths = sequences.map(s => s.seq.length);
    if (!lengths.every(len => len === lengths[0])) {
        return { error: 'Sequences have different lengths. Please align sequences first.' };
    }

    return { converted: true, text: toBppFormat(sequences), sequences: sequences };
}

// Download text as a file
function downloadAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export { detectFormat, convertToBpp, downloadAsFile };
