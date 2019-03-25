import React from "react"
import GetFile from "./GetFile"

function MapFileUpload(props) {
    let upLoadStyle = {padding: 20};
    if(props.sequenceData.length > 0)
    {
        return (
            <div style={upLoadStyle}>
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
    const mapData = new Map();
    
    try{
        let breakDelimVec = text.trim().split("\n");
        if(breakDelimVec.length>0)
        {
            for(let pair of breakDelimVec)
            {
                let labelPair=pair.trim().split(/\s+/g);
                if(labelPair.length===2)
                    mapData.set(labelPair[0],labelPair[1]);
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

function getSpeciesList(mapData)
{
    const spNameList = [...mapData.values()];
    const UniquespNameList = [...new Set(spNameList)];
    return UniquespNameList;
}



export { ParseMapText, MapFileUpload, getSpeciesList }
