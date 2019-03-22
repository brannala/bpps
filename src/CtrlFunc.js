
function ParseMapText(text)
{
    const mapData = [];
    
    try{
        let breakDelimVec = text.trim().split("\n");
        if(breakDelimVec.length>0)
        {
            for(let i in breakDelimVec)
            {
                let labelPair=breakDelimVec[i].trim().split(/\s+/g);
                if(labelPair.length===2)
                    mapData.push({seqName: labelPair[0], spName: labelPair[1]});
                else
                    throw new Error(`map file syntax error at: ${labelPair[0]}`); 
            }

        }
        else
            throw new Error("Empty map file!");
        return mapData;
    }
    catch(err){ alert(`Error: ${err.message}`); } 

};

const pairwiseDistance = (seq1,seq2) =>
{
    let p2Dist = 0.0;
    for(let i in seq1)
    {
        if(seq1[i]!==seq2[i]) p2Dist += 1;
    }
    return p2Dist/seq1.length;
};

function getPriorMeans(sequenceData,mapData, p2D)
{
    




}





export { ParseMapText, pairwiseDistance }
