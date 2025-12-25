import React, { Component } from "react";
import { Columns, Column } from 'react-flex-columns';
import "./CtrlFile.css";
import { ParseMapText, MapFileUpload, getSpeciesList, validateMapAgainstSequences } from "./CtrlFunc";
import { getSeqBySpecies, priorFromSeqs, getAllMaxNumberSeqs } from "./PriorFunc";
import CreateControlFile from "./CreateControlFile";
import CtrlFileOptions from "./CtrlFileOptions";
import { randomTree, newickFromTree } from "./Trees";
import { ErrorBanner, WarningBanner } from "./ErrorMessage";

class CtrlFile extends Component {
    constructor(props) {
        super(props);
        this.state = { mapData: [], mapFileName: '', ctrlFileOpts: { speciesDelim: false, speciesTreeInf: true, diploid: false,
                                                                     burnin: 2000, sampleFreq: 2, mcmcSamples: 20000 },
                       nTree: "", seqBySpecies: [], priors: { priorTheta: {a: 3.0, b: 0.002}, priorTau: {a: 3.0, b: 0.002}}, numberSeqs: [], speciesList: [],
                       mapFileError: null, mapFileWarning: null };
        this.handleMapFileRead = this.handleMapFileRead.bind(this);
        this.clearMapFileError = this.clearMapFileError.bind(this);
        this.clearMapFileWarning = this.clearMapFileWarning.bind(this);
        this.handleSpecDelimCheckbox = this.handleSpecDelimCheckbox.bind(this);
        this.handleSpecTreeInfCheckbox = this.handleSpecTreeInfCheckbox.bind(this);
        this.handleDiploidCheckbox = this.handleDiploidCheckbox.bind(this);
        this.handleBurninSet = this.handleBurninSet.bind(this);
        this.handleSampleFreqSet = this.handleSampleFreqSet.bind(this);
        this.handleMcmcSamples = this.handleMcmcSamples.bind(this);
        this.handleRandomTopology = this.handleRandomTopology.bind(this);
    }

    handleRandomTopology() {
        if (this.state.speciesList.length > 0) {
            const rTree = randomTree(this.state.speciesList);
            const nT = newickFromTree(rTree);
            this.setState({ nTree: nT });
        }
    }

    clearMapFileError() {
        this.setState({ mapFileError: null });
    }

    clearMapFileWarning() {
        this.setState({ mapFileWarning: null });
    }

    handleMapFileRead(fileContents,fileName)
    {
        // Clear any previous errors/warnings
        this.setState({ mapFileError: null, mapFileWarning: null });

        // Parse the map file
        const parseResult = ParseMapText(fileContents);

        if (parseResult.error) {
            this.setState({ mapFileError: parseResult.error });
            return;
        }

        const mapData = parseResult.data;

        // Validate map file against sequence data
        const validation = validateMapAgainstSequences(mapData, this.props.sequenceData);

        if (!validation.valid) {
            this.setState({ mapFileError: validation.errors.join('. ') });
            return;
        }

        // Set warning if there are specimens in sequences not in map file
        const warning = validation.warnings.length > 0 ? validation.warnings.join('. ') : null;

        const speciesList = getSpeciesList(mapData);
        const rTree = randomTree(speciesList);
        const nT = newickFromTree(rTree);
        const seqBySpecies = getSeqBySpecies(this.props.sequenceData, speciesList, mapData);
        const priors = priorFromSeqs(seqBySpecies);

        // Compute all max sequence counts in a single pass (much faster than per-species calls)
        const maxCountsMap = getAllMaxNumberSeqs(speciesList, this.props.sequenceData, mapData);
        let numSeqs = '';
        for(let i = 0; i < speciesList.length; i++)
          numSeqs += `${maxCountsMap.get(speciesList[i])}  `;

        // Set all state in a single call
        this.setState({
            mapData: mapData,
            mapFileName: fileName,
            speciesList: speciesList,
            nTree: nT,
            seqBySpecies: seqBySpecies,
            priors: priors,
            numberSeqs: numSeqs,
            mapFileWarning: warning
        });
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
                <h2>Step 3: Create Control File</h2>
                <Columns gutters stackMaxWidth={700}>
                  <Column size={22}>
	            <MapFileUpload sequenceData={this.props.sequenceData} readFile={this.handleMapFileRead} />
                    <ErrorBanner message={this.state.mapFileError} onDismiss={this.clearMapFileError} />
                    <WarningBanner message={this.state.mapFileWarning} onDismiss={this.clearMapFileWarning} />
                    <CtrlFileOptions mapData={this.state.mapData} ctrlFileOpts={this.state.ctrlFileOpts}
                                     speciesList={this.state.speciesList}
                                     handleSpecDelimCheckbox={this.handleSpecDelimCheckbox}
                                     handleSpecTreeInfCheckbox={this.handleSpecTreeInfCheckbox}
                                     handleDiploidCheckbox={this.handleDiploidCheckbox}
                                     handleBurninSet={this.handleBurninSet}
                                     handleSampleFreqSet={this.handleSampleFreqSet}
                                     handleMcmcSamples={this.handleMcmcSamples}
                                     handleRandomTopology={this.handleRandomTopology}/>
                  </Column>
                  <Column size={35}>
                    <CreateControlFile sequenceData={this.props.sequenceData} mapData={this.state.mapData} seqFileName={this.props.seqFileName}
                                       mapFileName={this.state.mapFileName} ctrlFileOpts={this.state.ctrlFileOpts} speciesList={this.state.speciesList}
                                       numberSeqs={this.state.numberSeqs} nTree={this.state.nTree} priors={this.state.priors}></CreateControlFile>
                  </Column>
                </Columns>
              </div>
              </div>
        );
    }
}

export default CtrlFile;
