import React from "react"
import GetFile from "./GetFile"

function MapFileUpload(props) {
    if(props.sequenceData.length > 0)
    {
        return (
            <div>
              <p>Sequence data processing successful!</p>
              <p>Upload a map file to continue</p>
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
    catch(err){ alert(`Error: ${err.message}`); return [];} 

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

function getSpeciesList(mapData)
{
    const spNameList = [];
    for(let i in mapData)
        spNameList.push(mapData[i].spName);
    const UniquespNameList = [...new Set(spNameList)];
    return UniquespNameList;
}

function getPriorMeans(sequenceData,mapData, p2D)
{
    

}


export { ParseMapText, MapFileUpload, getSpeciesList, pairwiseDistance }
