
function uniqueSeqNames(sequenceData)
{
    const allNames = [];
    for(let i in sequenceData)
        for(let j in sequenceData[i].sequences)
            allNames.push(sequenceData[i].sequences[j].seqname);
     return [...new Set(allNames)];
}


function seqToSpecName(uniqueNames,regExp_SpName)
{
    const sqToSN = [];
    for(let i in regExp_SpName)
        sqToSN.push({seqNames: uniqueNames.filter((v) => v.match(regExp_SpName[i].reg_exp)), reg_exp: regExp_SpName[i].reg_exp, spName: regExp_SpName[i].spName});
    return sqToSN;
}




export { uniqueSeqNames, seqToSpecName }
