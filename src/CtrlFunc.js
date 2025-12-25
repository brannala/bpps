import React from "react"
import GetFile from "./GetFile"

function MapFileUpload(props) {
    let upLoadStyle = {padding: '20px 0'};
    if(props.sequenceData.length > 0)
    {
        return (
            <div style={upLoadStyle}>
              <GetFile readFile={props.readFile} fileType={"map"}/>
            </div>
        );
    }
    else
    {
        return (
            <p>Go to step 1 and upload sequence data to begin.</p>
        );
    }
}

function ParseMapText(text)
{
    const mapData = new Map();

    try {
        const trimmedText = text.trim();
        if (!trimmedText) {
            throw new Error("Empty map file");
        }

        const lines = trimmedText.split(/\r?\n/);
        const duplicates = [];

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum].trim();

            // Skip empty lines
            if (!line) continue;

            // Skip comment lines (starting with #)
            if (line.startsWith('#')) continue;

            const tokens = line.split(/\s+/);

            if (tokens.length < 2) {
                throw new Error(`Line ${lineNum + 1}: Expected "specimen species" but found only "${tokens[0]}"`);
            }

            if (tokens.length > 2) {
                throw new Error(`Line ${lineNum + 1}: Expected 2 columns but found ${tokens.length}. Use underscores instead of spaces in names.`);
            }

            const specimen = tokens[0];
            const species = tokens[1];

            // Check for duplicate specimens
            if (mapData.has(specimen)) {
                duplicates.push(specimen);
            }

            mapData.set(specimen, species);
        }

        if (mapData.size === 0) {
            throw new Error("No valid specimen-species mappings found in file");
        }

        if (duplicates.length > 0) {
            throw new Error(`Duplicate specimen names: ${duplicates.join(', ')}`);
        }

        return { data: mapData, error: null };
    }
    catch (err) {
        return { data: new Map(), error: err.message };
    }
}

// Extract specimen ID from sequence name (part after ^, or full name if no ^)
function getSpecimenFromSeqName(seqName) {
    const caretIndex = seqName.indexOf('^');
    return caretIndex >= 0 ? seqName.substring(caretIndex + 1) : seqName;
}

// Get all unique specimen IDs from sequence data
function getSpecimensFromSequenceData(sequenceData) {
    const specimens = new Set();
    for (const locus of sequenceData) {
        for (const seq of locus.sequences) {
            specimens.add(getSpecimenFromSeqName(seq.seqname));
        }
    }
    return specimens;
}

// Validate that map file specimens match sequence data specimens
function validateMapAgainstSequences(mapData, sequenceData) {
    const seqSpecimens = getSpecimensFromSequenceData(sequenceData);
    const mapSpecimens = new Set(mapData.keys());

    const errors = [];
    const warnings = [];

    // Check for specimens in map file that don't exist in sequences
    const unmatchedInMap = [];
    for (const specimen of mapSpecimens) {
        if (!seqSpecimens.has(specimen)) {
            unmatchedInMap.push(specimen);
        }
    }

    if (unmatchedInMap.length > 0) {
        errors.push(`Specimens in map file not found in sequences: ${unmatchedInMap.slice(0, 5).join(', ')}${unmatchedInMap.length > 5 ? ` (and ${unmatchedInMap.length - 5} more)` : ''}`);
    }

    // Check for specimens in sequences that aren't in map file
    const unmatchedInSeqs = [];
    for (const specimen of seqSpecimens) {
        if (!mapSpecimens.has(specimen)) {
            unmatchedInSeqs.push(specimen);
        }
    }

    if (unmatchedInSeqs.length > 0) {
        warnings.push(`Specimens in sequences not found in map file: ${unmatchedInSeqs.slice(0, 5).join(', ')}${unmatchedInSeqs.length > 5 ? ` (and ${unmatchedInSeqs.length - 5} more)` : ''}`);
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        matchedCount: mapSpecimens.size - unmatchedInMap.length,
        totalMapSpecimens: mapSpecimens.size,
        totalSeqSpecimens: seqSpecimens.size
    };
}

function getSpeciesList(mapData)
{
    const spNameList = [...mapData.values()];
    const UniquespNameList = [...new Set(spNameList)];
    return UniquespNameList;
}



export { ParseMapText, MapFileUpload, getSpeciesList, validateMapAgainstSequences }
