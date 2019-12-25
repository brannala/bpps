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
function createMapFileText(seqMatches)
{
    let mapFileText = "";
    let rExp = new RegExp('.*^.+');
    let mapData = [];
    try{
	if(seqMatches.matchedSeqs.length>0)
	{
	    for(let i in seqMatches.matchedSeqs)
		for(let j in seqMatches.matchedSeqs[i].seqNames)
		    if(seqMatches.matchedSeqs[i].seqNames[j].match(rExp)===null)
		        throw new Error("sequence labels must be of format IDName^SpecimenName. Sequence name was missing ^ !"); 
            
            // get mapData as spName +  specimen IDs
	    for(let i in seqMatches.matchedSeqs)
            {
                let specimenID = [];
                for(let j in seqMatches.matchedSeqs[i].seqNames)
                    specimenID.push(seqMatches.matchedSeqs[i].seqNames[j].substr(seqMatches.matchedSeqs[i].seqNames[j].indexOf('^')+1,));
                
                specimenID = [...new Set(specimenID)];
                mapData.push({specimen: specimenID, spName: seqMatches.matchedSeqs[i].spName});
            }
            console.log(mapData[0].specimen[2]);
            for(let i in mapData)
                for(let j in mapData[i].specimen)
		    mapFileText += mapData[i].specimen[j] + "  " + mapData[i].spName + "\n";
            console.log(mapFileText);
        }
    }
    catch(err) { alert(err); }
    return mapFileText;
}


export { uniqueSeqNames, seqToSpecName, createMapFileText }
