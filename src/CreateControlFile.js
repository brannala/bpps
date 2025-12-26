import React, { Component } from 'react';
var FileSaver = require('file-saver');


function createControlFileText(seqFileName,mapFileName,mapData,seqData,speciesList,ctrlFileOpts,numberSeqs,nTree,labeledNewick,priors,migrationConfig,introgressionConfig,singleSpeciesMode) {

    let controlFileText = "";
    let nloci = seqData.length;

    // Single species mode: simplified control file without Imap, tauprior, or tree
    if (singleSpeciesMode) {
        controlFileText += `    seed = ${ctrlFileOpts.seed} \n`;
        controlFileText += `    seqfile = ${seqFileName} \n`;
        controlFileText += `    jobname = ${ctrlFileOpts.jobname} \n\n`;
        controlFileText += `    speciesdelimitation = 0\n`;
        controlFileText += `    speciestree = 0 \n`;
        controlFileText += `    species&tree = 1  ${speciesList[0]}\n`;
        controlFileText += `                      ${numberSeqs}\n`;
        controlFileText += `    phase = ${Number(ctrlFileOpts.diploid)}\n`;
        controlFileText += "    cleandata = 0\n";
        controlFileText += "    usedata = 1\n";
        controlFileText += `    nloci = ${nloci}  \n`;
        controlFileText += `    thetaprior = invgamma ${priors.priorTheta.a}  ${priors.priorTheta.b.toPrecision(2)} \n`;
        // No tauprior for single species (no divergence times)
        controlFileText += "    finetune = 1 Gage:0.02 Gspr:0.02 tau:0.02 mix:0.02 lrht:0.02 phis:0.02 pi:0.02 \n";
        controlFileText += "    print = 1 0 0 0 \n";
        controlFileText += `    burnin = ${ctrlFileOpts.burnin} \n`;
        controlFileText += `    sampfreq = ${ctrlFileOpts.sampleFreq} \n`;
        controlFileText += `    nsample = ${ctrlFileOpts.mcmcSamples} \n`;
        return controlFileText;
    }

    // Multi-species mode: full control file
    // Determine tree string based on model:
    // - Introgression: use extended Newick from introgressionConfig
    // - Migration: use labeled Newick (includes internal node labels)
    // - Standard: use plain tree
    let treeString;
    if (introgressionConfig && introgressionConfig.enabled && introgressionConfig.extendedNewick) {
        // Use extended Newick for introgression (already includes semicolon, so strip it)
        treeString = introgressionConfig.extendedNewick.replace(/;$/, '');
    } else if (migrationConfig && migrationConfig.enabled && labeledNewick) {
        treeString = labeledNewick;
    } else {
        treeString = nTree;
    }

    controlFileText += `    seed = ${ctrlFileOpts.seed} \n`;
    controlFileText += `    seqfile = ${seqFileName} \n`;
    controlFileText += `    Imapfile = ${mapFileName} \n`;
    controlFileText += `    jobname = ${ctrlFileOpts.jobname} \n\n`;
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
    controlFileText += `                    ${treeString}; \n`;
    controlFileText += "    phase =";
    for(let i=0; i<speciesList.length; i++)
        controlFileText += ` ${Number(ctrlFileOpts.diploid)}`;
    controlFileText += "\n";
    controlFileText += "    cleandata = 0\n";
    controlFileText += "    usedata = 1\n";
    controlFileText += `    nloci = ${nloci}  \n`;
    controlFileText += `    thetaprior = invgamma ${priors.priorTheta.a}  ${priors.priorTheta.b.toPrecision(2)} \n`;
    controlFileText += `    tauprior = invgamma ${priors.priorTau.a}  ${priors.priorTau.b.toPrecision(2)} \n`;

    // Add migration parameters if enabled (MSC-M model)
    if (migrationConfig && migrationConfig.enabled && migrationConfig.routes.length > 0) {
        controlFileText += `    migration = ${migrationConfig.routes.length}\n`;
        for (const route of migrationConfig.routes) {
            controlFileText += `               ${route.source} ${route.target}\n`;
        }
        controlFileText += `    wprior = ${migrationConfig.wprior.alpha} ${migrationConfig.wprior.beta}\n`;
    }

    // Add introgression parameters if enabled (MSC-I model)
    if (introgressionConfig && introgressionConfig.enabled) {
        controlFileText += `    phiprior = ${introgressionConfig.phiprior.alpha} ${introgressionConfig.phiprior.beta}\n`;
    }

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
                                             this.props.numberSeqs,this.props.nTree,this.props.labeledNewick,
                                             this.props.priors,this.props.migrationConfig,this.props.introgressionConfig,
                                             this.props.singleSpeciesMode);

            let blob = new Blob([text],{type: "text/plain;charset=utf-8"});
	    let downloadClick = (e) => { FileSaver.saveAs(blob,controlFileName); }
	return (
	    <div className="downloadFile">
              <textarea className="ctrlFileBox" readOnly wrap='off' value={text}/>
              <div className="downLoadButton">
	        <button className="downButton" onClick={downloadClick}>Save control file</button>
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
