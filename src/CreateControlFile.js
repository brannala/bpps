import React, { Component } from 'react';
import CtrlFunc, { getSpeciesList } from "./CtrlFunc";
var FileSaver = require('file-saver');

function createControlFileText(seqFileName,mapFileName,mapData,seqData,speciesList) {

    let controlFileText = "";

    controlFileText += "    seed = -1 \n";
    controlFileText += `    seqfile = ${seqFileName} \n`;
    controlFileText += `    Imapfile = ${mapFileName} \n`; 
    controlFileText += "    outfile = out.txt \n    mcmcfile = mcmc.txt \n\n";
    controlFileText += `    species&tree = ${speciesList.length}  `;
    for(let i in speciesList)
        controlFileText += `${speciesList[i]}  `;
    controlFileText += "\n";
    controlFileText += `    nloci = ${seqData.length} \n`;
    
    return controlFileText;
}







class CreateControlFile extends Component {



    render() {
        if(this.props.mapData.length > 0)
        {
            let controlFileName=this.props.seqFileName;
            let speciesList = getSpeciesList(this.props.mapData);
            let text = createControlFileText(this.props.seqFileName,this.props.mapFileName,this.props.mapData,this.props.sequenceData,speciesList);
            let blob = new Blob([text],{type: "text/plain;charset=utf-8"});
	    let downloadClick = (e) => { FileSaver.saveAs(blob,controlFileName); }
	return (
	    <div className="downloadFile">
	      <label>Control file is ready for download: </label><button className="downButton" onClick={downloadClick}>Download</button>
	    </div>
            );
            
        }
        else
            return(
                null
            );
    }
}

export default CreateControlFile;
