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

export { uniqueSeqNames, seqToSpecName }
