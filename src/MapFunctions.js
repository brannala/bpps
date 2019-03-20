// functions for creating map file

// returns vector of unique sequence names that is a subset of all sequence names
function uniqueSeqNames(sequenceData)
{
    const allNames = [];
    for(let i in sequenceData)
        for(let j in sequenceData[i].sequences)
            allNames.push(sequenceData[i].sequences[j].seqname);
     return [...new Set(allNames)];
}

// returns vector of objects: each a  list of sequences filtered by a reg_exp, the reg_exp, and a species name 
function seqToSpecName(uniqueNames,regExp_SpName)
{
    const sqToSN = [];
    for(let i in regExp_SpName)
        sqToSN.push({seqNames: uniqueNames.filter((v) => v.match(regExp_SpName[i].reg_exp)), reg_exp: regExp_SpName[i].reg_exp, spName: regExp_SpName[i].spName});
    return sqToSN;
}

export { uniqueSeqNames, seqToSpecName }
