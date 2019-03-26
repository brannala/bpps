function isSpName(seqName,spName,mapData)
{
    if(mapData.get(seqName)===spName)
        return true;
    return false;
}

function getNumberSeqs(spName,mapData)
{
    let noSeqs=0;
    for(let species of mapData.values())
        if(species === spName) noSeqs++;
    return noSeqs;
}

function getMaxNumberSeqs(spName,sequenceData,mapData)
{
    let seqMaxCount = 0;
    for(let locus of sequenceData)
    {
        let sequenceCount=0;
        for(let sequences of locus.sequences)
            if(isSpName(getSpecimen(sequences.seqname),spName,mapData))
                sequenceCount++;
        if(sequenceCount > seqMaxCount)
            seqMaxCount = sequenceCount;
    }
    return seqMaxCount;
}

function getSpecimen(seqName)
{
    return seqName.substr(seqName.indexOf('^')+1);
}

function getSeqBySpecies (sequenceData,speciesList,mapData) {
    const seqBySpec=[];
    for(let locus of sequenceData)
        seqBySpec.push([]);
    let l=0;
    for(let locus of sequenceData)
    {
        for(let species of speciesList)
        {
            let seqs = [];
            let seqsEmpty=true;
            for(let sequences of locus.sequences)
            {
//                console.log(mapData[getSpecimen(sequences.seqname)]+ " " + species);
                if(isSpName(getSpecimen(sequences.seqname),species,mapData))
                {
                    seqs.push(sequences.seq); seqsEmpty=false;
//                    console.log(getSpecimen(sequences.seqname) + " " + species); 
                }
            }
            if(!seqsEmpty)
                seqBySpec[l].push(seqs); 
        }
        l++;
    }
        return seqBySpec;
}

function pairwiseDistance(seq1,seq2)
{
    let p2Dist = 0.0;
    for(let i in seq1)
        p2Dist += siteMismatchProb(seq1[i],seq2[i]);
    return p2Dist/seq1.length;
};

function siteMismatchProb(site1,site2)
{
    const missingData = new Set();
    missingData.add('-');
    missingData.add('?');
    if(site1 != site2)
        if(!missingData.has(site1)&&!missingData.has(site2))
            return 1;
    return 0;
}


function avgDistance(sequences)
{
    let sumDist=0.0;
    if(sequences.length <= 1)
        return 0;
    for(let i=0; i < (sequences.length-1); i++)
        for (let j=i+1; j < sequences.length; j++)
    {
        sumDist += pairwiseDistance(sequences[i],sequences[j]);
    }
    return (2.0*sumDist)/(sequences.length*(sequences.length-1));
}

function maxDistance(sequences)
{
    let maxDist=0.0;
    let combinedSeqs = [];
    for(let locus of sequences)
    {
        let allSeqs=[];
        for(let seqs of locus)
            allSeqs = allSeqs.concat(seqs);
        combinedSeqs.push(allSeqs);
    }
 //   console.log(combinedSeqs);
    for(let locus of combinedSeqs)
        for(let k=0; k < (locus.length - 1); k++)
            for(let j=k; j < locus.length; j++)
                if(pairwiseDistance(locus[k],locus[j]) > maxDist)
                    maxDist = pairwiseDistance(locus[k],locus[j]);
    return maxDist;
}

function priorFromSeqs(sequences)
{
    let priorMeanTheta=0;
    let priorRootAge=0;
    let totalSpecies=0;
    for(let locus of sequences)
    {
        totalSpecies += locus.length;
        for(let species of locus)
            priorMeanTheta += avgDistance(species);
    }
    priorMeanTheta = priorMeanTheta/totalSpecies;
    priorRootAge=maxDistance(sequences);
    const priorTheta = { a: 3.0, b: priorMeanTheta*2.0 }
    const priorTau = { a: 3.0, b:priorRootAge*2.0 }
    return { priorTheta: priorTheta, priorTau: priorTau }; 
}


export { getSeqBySpecies, pairwiseDistance, avgDistance, priorFromSeqs, maxDistance, getNumberSeqs, getMaxNumberSeqs }
