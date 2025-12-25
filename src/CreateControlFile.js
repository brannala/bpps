import React, { Component } from 'react';
var FileSaver = require('file-saver');


function createControlFileText(seqFileName,mapFileName,mapData,seqData,speciesList,ctrlFileOpts,numberSeqs,nTree,priors) {

    let controlFileText = "";
    let nloci = seqData.length;
    
    controlFileText += "    seed = -1 \n";
    controlFileText += `    seqfile = ${seqFileName} \n`;
    controlFileText += `    Imapfile = ${mapFileName} \n`; 
    controlFileText += "    jobname = out \n\n";
    if(Number(ctrlFileOpts.speciesDelim)===0)
        controlFileText += `    speciesdelimitation = ${Number(ctrlFileOpts.speciesDelim)}\n`;
    else
        controlFileText += `    speciesdelimitation = ${Number(ctrlFileOpts.speciesDelim)} 0 2 \n`;
    controlFileText += `    speciestree = ${Number(ctrlFileOpts.speciesTreeInf)} \n`;
    controlFileText += `    species&tree = ${speciesList.length}  `;
    for(let i in speciesList)
        controlFileText += `${speciesList[i]}  `;
    controlFileText += "\n                      ";
    controlFileText += numberSeqs;
    controlFileText += "\n";
    controlFileText += `                    ${nTree}; \n`;
    controlFileText += "    phase =";
    for(let i=0; i<speciesList.length; i++)
        controlFileText += ` ${Number(ctrlFileOpts.diploid)}`;
    controlFileText += "\n";
    controlFileText += "    cleandata = 0\n";
    controlFileText += "    usedata = 1\n";    
    controlFileText += `    nloci = ${nloci}  \n`;
    controlFileText += `    thetaprior = invgamma ${priors.priorTheta.a}  ${priors.priorTheta.b.toPrecision(2)} \n`; 
    controlFileText += `    tauprior = invgamma ${priors.priorTau.a}  ${priors.priorTau.b.toPrecision(2)} \n`; 

    controlFileText += "    finetune = 1 Gage:0.02 Gspr:0.02 tau:0.02 mix:0.02 lrht:0.02 phis:0.02 pi:0.02 \n";
    controlFileText += "    print = 1 0 0 0 \n";
    controlFileText += `    burnin = ${ctrlFileOpts.burnin} \n`;
    controlFileText += `    sampfreq = ${ctrlFileOpts.sampleFreq} \n`;
    controlFileText += `    nsample = ${ctrlFileOpts.mcmcSamples} \n`;
    return controlFileText;
}


class CreateControlFile extends Component {


    render() {
        let controlFileName = "";
//        console.log(this.props.mapData);
        if(this.props.mapData.size > 0)
        {
            let namePrefix = this.props.seqFileName.substr(0,this.props.seqFileName.indexOf('.'));
            if(namePrefix === "")
                controlFileName = this.props.seqFileName + ".ctl";
            else
                controlFileName = namePrefix + ".ctl";

            let text = createControlFileText(this.props.seqFileName,this.props.mapFileName,this.props.mapData,
                                             this.props.sequenceData,this.props.speciesList,this.props.ctrlFileOpts,
                                             this.props.numberSeqs,this.props.nTree,this.props.priors);

            let blob = new Blob([text],{type: "text/plain;charset=utf-8"});
	    let downloadClick = (e) => { FileSaver.saveAs(blob,controlFileName); }
	return (
	    <div className="downloadFile">
              <textarea className="ctrlFileBox" readOnly wrap='off' value={text}/>
              <div downLoadButton>
	      <label>Control file is ready for download: </label><button className="downButton" onClick={downloadClick}>Download</button>
              </div>
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
