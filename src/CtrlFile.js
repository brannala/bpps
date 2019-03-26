import React, { Component } from "react";
import { Columns, Column } from 'react-flex-columns';
import "./CtrlFile.css";
import CtrlFunc, { ParseMapText, MapFileUpload, getSpeciesList } from "./CtrlFunc";
import PriorFunc, { getSeqBySpecies, avgDistance, maxDistance, priorFromSeqs, getNumberSeqs, getMaxNumberSeqs } from "./PriorFunc";
import CreateControlFile from "./CreateControlFile";
import CtrlFileOptions from "./CtrlFileOptions";
import GetFile from "./GetFile";
import Trees, { randomTree, newickFromTree } from "./Trees";
var FileSaver = require('file-saver');


    
class CtrlFile extends Component {
    constructor(props) {
        super(props);

        this.state = { mapData: [], mapFileName: '', ctrlFileOpts: { speciesDelim: false, speciesTreeInf: true, diploid: false,
                                                                     burnin: 2000, sampleFreq: 2, mcmcSamples: 20000 },
                       nTree: "", seqBySpecies: [], priors: { priorTheta: {a: 3.0, b: 0.002}, priorTau: {a: 3.0, b: 0.002}}, numberSeqs: [], speciesList: [] };

        this.handleMapFileRead = this.handleMapFileRead.bind(this);
        this.handleSpecDelimCheckbox = this.handleSpecDelimCheckbox.bind(this);
        this.handleSpecTreeInfCheckbox = this.handleSpecTreeInfCheckbox.bind(this);
        this.handleDiploidCheckbox = this.handleDiploidCheckbox.bind(this);
        this.handleBurninSet = this.handleBurninSet.bind(this);
        this.handleSampleFreqSet = this.handleSampleFreqSet.bind(this);
        this.handleMcmcSamples = this.handleMcmcSamples.bind(this);
    }

    handleMapFileRead(fileContents,fileName)
    {
        console.log(ParseMapText(fileContents));
        this.setState({ mapData: ParseMapText(fileContents) });
        this.setState({ mapFileName: fileName });
        this.setState({  speciesList: getSpeciesList(this.state.mapData)});
        let rTree = randomTree(this.state.speciesList);
        let nT = newickFromTree(rTree);
        this.setState({ nTree: nT});
        this.setState({ seqBySpecies: getSeqBySpecies(this.props.sequenceData, this.state.speciesList, this.state.mapData) });
        this.setState({ priors: priorFromSeqs(this.state.seqBySpecies) });
        let numSeqs ='';
        for(let i in this.state.speciesList)
          numSeqs += `${getMaxNumberSeqs(this.state.speciesList[i],this.props.sequenceData,this.state.mapData)}  `;
        this.setState({ numberSeqs: numSeqs });
        
    }


    handleSpecDelimCheckbox(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        this.state.ctrlFileOpts.speciesDelim ? cFO.speciesDelim = false : cFO.speciesDelim = true;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleSpecTreeInfCheckbox(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        this.state.ctrlFileOpts.speciesTreeInf ? cFO.speciesTreeInf = false : cFO.speciesTreeInf = true;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleDiploidCheckbox(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        this.state.ctrlFileOpts.diploid ? cFO.diploid = false : cFO.diploid = true;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleBurninSet(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.burnin = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleSampleFreqSet(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.sampleFreq = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleMcmcSamples(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.mcmcSamples = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }


    
    

    render() {
        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 3:</h2>
                <p>Create a control file in bpp format. We will use the sequence data you uploaded to choose sensible defaults</p>
                <Columns gutters stackMaxWidth={700}>
                  <Column size={22}>
	            <MapFileUpload sequenceData={this.props.sequenceData} readFile={this.handleMapFileRead} />
                    <CtrlFileOptions mapData={this.state.mapData} ctrlFileOpts={this.state.ctrlFileOpts}
                                     handleSpecDelimCheckbox={this.handleSpecDelimCheckbox}
                                     handleSpecTreeInfCheckbox={this.handleSpecTreeInfCheckbox}
                                     handleDiploidCheckbox={this.handleDiploidCheckbox}
                                     handleBurninSet={this.handleBurninSet}
                                     handleSampleFreqSet={this.handleSampleFreqSet}
                                     handleMcmcSamples={this.handleMcmcSamples}/>

                  </Column>
                  <Column size={35}>

                    <CreateControlFile sequenceData={this.props.sequenceData} mapData={this.state.mapData} seqFileName={this.props.seqFileName}
                                       mapFileName={this.state.mapFileName} ctrlFileOpts={this.state.ctrlFileOpts} speciesList={this.state.speciesList}
                                       numberSeqs={this.state.numberSeqs} nTree={this.state.nTree} priors={this.state.priors}></CreateControlFile>


                  </Column>
                </Columns>
              </div>
              <div>

              </div>
              <div className="quick-start"><p>Quick start: If step 1 is complete a link will appear above to upload a map file. Upload the mapfile
                                             created in step 2 (or another mapfile conforming with the sequence data uploaded in step 1.</p></div>
            </div>
        );
    }
}

export default CtrlFile;
