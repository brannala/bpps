// functions for creating map file

// returns vector of unique sequence names that is a subset of all sequence names
function uniqueSeqNames(sequenceData)
{
    if(sequenceData.length>0)
    {
        const allNames = [];
        for(let i in sequenceData)
            for(let j in sequenceData[i].sequences)
                allNames.push(sequenceData[i].sequences[j].seqname);
        return [...new Set(allNames)];
    }
    else
        return [];
}

// returns vector of objects: each a  list of sequences filtered by a reg_exp, the reg_exp, and a species name 
function seqToSpecName(uniqueNames,regExp_SpName)
{
    const sqToSN = [];
    let unmatched = uniqueNames;
    for(let i in regExp_SpName)
    {
        let matches = unmatched.filter((v) => v.match(regExp_SpName[i].reg_exp));
        for(let j in matches)
        {
            let index=unmatched.indexOf(matches[j]);
            if(index > -1)
                unmatched.splice(index,1);
        }
        sqToSN.push({seqNames: matches, reg_exp: regExp_SpName[i].reg_exp, spName: regExp_SpName[i].spName});
    }
    return { matchedSeqs: sqToSN, unmatchedSeqs: unmatched };
}
// returns a formatted string for creating map file
// Handles both traditional format (SpeciesName^SpecimenID) and simple format (just sequence names)
function createMapFileText(seqMatches)
{
    let mapFileText = "";
    let mapData = [];
    try{
	if(seqMatches.matchedSeqs.length>0)
	{
            // get mapData as spName + specimen IDs
	    for(let i in seqMatches.matchedSeqs)
            {
                let specimenID = [];
                for(let j in seqMatches.matchedSeqs[i].seqNames)
                {
                    const seqName = seqMatches.matchedSeqs[i].seqNames[j];
                    const caretIndex = seqName.indexOf('^');
                    if (caretIndex > 0) {
                        // Traditional format: extract specimen ID after ^
                        specimenID.push(seqName.substr(caretIndex + 1));
                    } else {
                        // Simple format: use full sequence name as specimen ID
                        specimenID.push(seqName);
                    }
                }

                specimenID = [...new Set(specimenID)];
                mapData.push({specimen: specimenID, spName: seqMatches.matchedSeqs[i].spName});
            }
            for(let i in mapData)
                for(let j in mapData[i].specimen)
		    mapFileText += mapData[i].specimen[j] + "  " + mapData[i].spName + "\n";
        }
        return { text: mapFileText, error: null };
    }
    catch(err) {
        return { text: "", error: err.message };
    }
}


// Extracts unique species names from the prefix before ^ in sequence names
// Returns array of { spName: string, reg_exp: RegExp } for each unique prefix
function guessSpeciesFromPrefix(sequenceData) {
    const uniqueNames = uniqueSeqNames(sequenceData);
    const prefixMap = new Map();

    for (const seqName of uniqueNames) {
        const caretIndex = seqName.indexOf('^');
        if (caretIndex > 0) {
            const prefix = seqName.substring(0, caretIndex);
            if (!prefixMap.has(prefix)) {
                prefixMap.set(prefix, []);
            }
            prefixMap.get(prefix).push(seqName);
        }
    }

    // Create filter objects for each unique prefix
    const filters = [];
    for (const [prefix] of prefixMap) {
        // Create regex that matches this exact prefix before ^
        const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg_exp = new RegExp(`^${escapedPrefix}\\^`);
        filters.push({ spName: prefix, reg_exp: reg_exp });
    }

    return filters;
}

export { uniqueSeqNames, seqToSpecName, createMapFileText, guessSpeciesFromPrefix }
