import React, { Component } from "react";
import { uniqueSeqNames, seqToSpecName, createMapFileText, guessSpeciesFromPrefix } from "./MapFunctions";
import { Columns, Column } from 'react-flex-columns';
import "./Mapfile.css";
import DisplayMatchedSeqs from "./DisplayMatchedSeqs";
import DisplayUnmatchedSeqs from "./DisplayUnmatchedSeqs";
import DisplayFilters from "./DisplayFilters";
import { ErrorMessage, ErrorBanner } from "./ErrorMessage";
var FileSaver = require('file-saver');

function MapIsDone(props)
{
    const [downloadError, setDownloadError] = React.useState(null);

    if(props.mapDone)
    {
        let mapFileName = props.seqFileName.substr(0,props.seqFileName.indexOf('.'));
        if(mapFileName==="")
            mapFileName = props.seqFileName + "map.txt";
        else
            mapFileName = mapFileName + "map.txt";

        const handleDownload = () => {
            const result = createMapFileText(props.seqMatches);
            if (result.error) {
                setDownloadError(result.error);
                return;
            }
            setDownloadError(null);
            var blob = new Blob([result.text], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, mapFileName);
        };

	return (
	    <div className="downloadFile">
              {downloadError && (
                <ErrorBanner message={downloadError} onDismiss={() => setDownloadError(null)} />
              )}
	      <label>Map file is ready for download: </label><button className="downButton" onClick={handleDownload}>Download</button>
	    </div>
	);
    }
    else
        return (
	    <div className="downloadFile">
	      <p>Sequence names must be completely filtered before map file can be downloaded.</p>
	    </div>
	);
}

class MapFile extends Component {
    constructor(props) {
        super(props);
        // mode: null = initial choice, 'auto' = auto-guessed, 'manual' = manual assignment
        this.state = { seqMatches: {matchedSeqs: [],  unmatchedSeqs: uniqueSeqNames(this.props.sequenceData)},
                       uniqSeqs: uniqueSeqNames(this.props.sequenceData), regExp_SpName: [], filters: [], mapDone: false,
                       selectedSeqs: new Set(), lastSelectedIndex: null, mode: null, regexExpanded: false, filtersExpanded: false,
                       formError: null, regexError: null };
        this.addFilter = this.addFilter.bind(this);
        this.autoGuessFromPrefix = this.autoGuessFromPrefix.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleSelectNone = this.handleSelectNone.bind(this);
        this.assignSelectedToSpecies = this.assignSelectedToSpecies.bind(this);
        this.chooseManualMode = this.chooseManualMode.bind(this);
        this.goBackToChoice = this.goBackToChoice.bind(this);
        this.toggleRegexExpanded = this.toggleRegexExpanded.bind(this);
        this.toggleFiltersExpanded = this.toggleFiltersExpanded.bind(this);
        this.clearFormError = this.clearFormError.bind(this);
        this.clearRegexError = this.clearRegexError.bind(this);
    }

    clearFormError() {
        this.setState({ formError: null });
    }

    clearRegexError() {
        this.setState({ regexError: null });
    }

    // Choose manual assignment mode
    chooseManualMode() {
        this.setState({ mode: 'manual' });
    }

    // Go back to initial choice screen
    goBackToChoice() {
        this.setState({
            mode: null,
            seqMatches: { matchedSeqs: [], unmatchedSeqs: uniqueSeqNames(this.props.sequenceData) },
            regExp_SpName: [],
            filters: [],
            mapDone: false,
            selectedSeqs: new Set(),
            lastSelectedIndex: null,
            regexExpanded: false
        });
    }

    // Toggle regex section visibility
    toggleRegexExpanded() {
        this.setState({ regexExpanded: !this.state.regexExpanded });
    }

    // Toggle filters section visibility
    toggleFiltersExpanded() {
        this.setState({ filtersExpanded: !this.state.filtersExpanded });
    }

    // Auto-generates filters based on the prefix before ^ in sequence names
    autoGuessFromPrefix() {
        this.setState({ formError: null });
        const guessedFilters = guessSpeciesFromPrefix(this.props.sequenceData);

        if (guessedFilters.length === 0) {
            this.setState({ formError: "No sequence names with '^' delimiter found. Sequence names should be in format: SpeciesName^SpecimenID" });
            return;
        }

        const uniq = [...this.state.uniqSeqs];
        let regExp_SpN = [];
        let filterArray = [];

        // Add all guessed filters
        for (const filter of guessedFilters) {
            filterArray.push({
                text: filter.spName + " + " + filter.reg_exp.toString(),
                key: Date.now() + Math.random()
            });
            regExp_SpN.push(filter);
        }

        const seqMc = seqToSpecName(uniq, regExp_SpN);

        this.setState({
            filters: filterArray,
            regExp_SpName: regExp_SpN,
            seqMatches: seqMc,
            mode: 'auto'
        });

        if (seqMc.matchedSeqs.length > 0 && seqMc.unmatchedSeqs.length === 0) {
            this.setState({ mapDone: true });
        }
    }

    // Handle selection changes from DisplayUnmatchedSeqs
    handleSelectionChange(newSelected, lastIndex) {
        this.setState({ selectedSeqs: newSelected, lastSelectedIndex: lastIndex });
    }

    // Select all unmatched sequences
    handleSelectAll() {
        const allUnmatched = new Set(this.state.seqMatches.unmatchedSeqs);
        this.setState({ selectedSeqs: allUnmatched });
    }

    // Clear selection
    handleSelectNone() {
        this.setState({ selectedSeqs: new Set(), lastSelectedIndex: null });
    }

    // Assign selected sequences to a species name
    assignSelectedToSpecies(e) {
        e.preventDefault();
        this.setState({ formError: null });
        const speciesName = this._assignSpNameInput.value.trim();

        if (!speciesName) {
            this.setState({ formError: "Please enter a species name" });
            return;
        }

        if (this.state.selectedSeqs.size === 0) {
            this.setState({ formError: "No sequences selected" });
            return;
        }

        // Create a regex that matches exactly these sequences
        const selectedArray = Array.from(this.state.selectedSeqs);
        const escapedNames = selectedArray.map(name =>
            name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
        const regexPattern = `^(${escapedNames.join('|')})$`;
        const rExp = new RegExp(regexPattern);

        // Add to filters
        const regExp_SpN = [...this.state.regExp_SpName];
        const filterArray = [...this.state.filters];
        const uniq = [...this.state.uniqSeqs];

        filterArray.unshift({
            text: `${speciesName} + [${selectedArray.length} sequences]`,
            key: Date.now()
        });
        regExp_SpN.push({ reg_exp: rExp, spName: speciesName });

        const seqMc = seqToSpecName(uniq, regExp_SpN);

        this.setState({
            filters: filterArray,
            regExp_SpName: regExp_SpN,
            seqMatches: seqMc,
            selectedSeqs: new Set(),
            lastSelectedIndex: null
        });

        if (seqMc.matchedSeqs.length > 0 && seqMc.unmatchedSeqs.length === 0) {
            this.setState({ mapDone: true });
        }

        this._assignSpNameInput.value = "";
    }

    // adds a new filter (filter = "species + regex" for display, regExp_SpName for filtering) and updates seqMatches object with new filter added
    addFilter(e) {
        e.preventDefault();
        this.setState({ regexError: null });

        const regExp_SpN = this.state.regExp_SpName;
        let rExp, seqMc = this.state.seqMatches, filterArray = this.state.filters;
        const uniq = [];
        for(let i in this.state.uniqSeqs)
            uniq.push(this.state.uniqSeqs[i]);

        if((this._spNameInput.value !== "")&&(this._regExpInput.value !== ""))
        {
            filterArray.unshift({ text: this._spNameInput.value + " + " + this._regExpInput.value, key: Date.now()});
            try
            {
                rExp = new RegExp(this._regExpInput.value);
                regExp_SpN.push({ reg_exp: rExp, spName: this._spNameInput.value });
                seqMc = seqToSpecName(uniq,regExp_SpN);
                this.setState({ filters: filterArray });
                this.setState({ regExp_SpName: regExp_SpN });
                this.setState({ seqMatches: seqMc });
            }
            catch(err) {
                this.setState({ regexError: `Invalid regular expression syntax: ${this._regExpInput.value}` });
                return;
            }

            if((seqMc.matchedSeqs.length>0)&&(seqMc.unmatchedSeqs.length===0))
                this.setState({ mapDone: true});
        }
        this._spNameInput.value = "";
        this._regExpInput.value = "";
    }

    
    renderChoiceScreen() {
        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 2: Create Map File</h2>
                <ErrorBanner message={this.state.formError} onDismiss={this.clearFormError} />
                <div className="mode-choice-container">
                  <div className="mode-choice-option" onClick={this.autoGuessFromPrefix}>
                    <h3>Automatic</h3>
                    <p>Auto-detect species from sequence name prefixes</p>
                    <span className="mode-choice-hint">
                      Best when sequence names use format: SpeciesName^SpecimenID
                    </span>
                  </div>
                  <div className="mode-choice-option" onClick={this.chooseManualMode}>
                    <h3>Manual</h3>
                    <p>Assign sequences to species using selection or regex</p>
                    <span className="mode-choice-hint">
                      Use when sequence names don't follow a standard pattern
                    </span>
                  </div>
                </div>
              </div>
            </div>
        );
    }

    renderAutoCompleteView() {
        // Simplified view when auto-guess matched everything
        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 2: Create Map File</h2>
                <div className="mode-header">
                  <button onClick={this.goBackToChoice} className="smallButton back-button">
                    Back
                  </button>
                  <span className="mode-label">
                    Auto-detected {this.state.seqMatches.matchedSeqs.length} species
                  </span>
                </div>
                <div className="auto-complete-content">
                  <DisplayMatchedSeqs seqMatches={this.state.seqMatches}/>
                </div>
              </div>
              <div>
                <MapIsDone mapDone={this.state.mapDone} seqMatches={this.state.seqMatches} seqFileName={this.props.seqFileName}/>
              </div>
            </div>
        );
    }

    renderManualInterface() {
        const isAutoMode = this.state.mode === 'auto';

        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 2: Create Map File</h2>
                <div className="mode-header">
                  <button onClick={this.goBackToChoice} className="smallButton back-button">
                    Back
                  </button>
                  <span className="mode-label">
                    {isAutoMode ? 'Auto-detected species (some need manual assignment)' : 'Manual assignment'}
                  </span>
                </div>
                <Columns gutters stackMaxWidth={700}>
                  <Column size={10}>
                    <DisplayUnmatchedSeqs
                        seqMatches={this.state.seqMatches}
                        selectedSeqs={this.state.selectedSeqs}
                        lastSelectedIndex={this.state.lastSelectedIndex}
                        onSelectionChange={this.handleSelectionChange}
                        onSelectAll={this.handleSelectAll}
                        onSelectNone={this.handleSelectNone}
                    />
                  </Column>
                  <Column size={21}>
                    <div className="title">
                      <p>Assign sequences to species</p>
                    </div>
                    <div className="col1">
                      <div className="assignment-method-primary">
                        <form onSubmit={this.assignSelectedToSpecies}>
                          <input
                            placeholder="species name"
                            ref={(a) => this._assignSpNameInput = a}
                            className={`assign-species-input ${this.state.formError ? 'input-error' : ''}`}
                          />
                          <button
                            type="submit"
                            className="smallButton"
                            disabled={this.state.selectedSeqs.size === 0}
                          >
                            Assign selected ({this.state.selectedSeqs.size})
                          </button>
                        </form>
                        <ErrorMessage message={this.state.formError} onDismiss={this.clearFormError} />
                        <span className="help-text">
                          Select sequences from list, then enter species name
                        </span>
                      </div>
                      <div className="regex-toggle" onClick={this.toggleRegexExpanded}>
                        <span className={`toggle-arrow ${this.state.regexExpanded ? 'expanded' : ''}`}>&#9654;</span>
                        <span>Advanced: Use regex pattern</span>
                      </div>
                      {this.state.regexExpanded && (
                        <div className="regex-section">
                          <form onSubmit={this.addFilter}>
                            <input placeholder="species name" ref={(a) => this._spNameInput = a}/>
                            <span className="regex-plus">+</span>
                            <input
                              placeholder="regex pattern"
                              ref={(a) => this._regExpInput = a}
                              className={this.state.regexError ? 'input-error' : ''}
                            />
                            <button type="submit" className="smallButton">Add</button>
                          </form>
                          <ErrorMessage message={this.state.regexError} onDismiss={this.clearRegexError} />
                          <span className="help-text">
                            e.g., /.*(Hsap).*/ matches sequences containing "Hsap"
                          </span>
                        </div>
                      )}
                    </div>
                    {this.state.filters.length > 0 && (
                      <div className="filters-collapsible">
                        <div className="filters-toggle" onClick={this.toggleFiltersExpanded}>
                          <span className={`toggle-arrow ${this.state.filtersExpanded ? 'expanded' : ''}`}>&#9654;</span>
                          <span>Assigned mappings ({this.state.filters.length})</span>
                        </div>
                        {this.state.filtersExpanded && (
                          <DisplayFilters filters={this.state.filters}/>
                        )}
                      </div>
                    )}
                  </Column>
                  <Column siz={20}>
                    <DisplayMatchedSeqs seqMatches={this.state.seqMatches}/>
                  </Column>
                </Columns>
              </div>
              <div>
                <MapIsDone mapDone={this.state.mapDone} seqMatches={this.state.seqMatches} seqFileName={this.props.seqFileName}/>
              </div>
            </div>
        );
    }

    render() {
        // Show choice screen if no mode selected yet
        if (this.state.mode === null) {
            return this.renderChoiceScreen();
        }
        // If auto mode and all sequences matched, show simplified view
        if (this.state.mode === 'auto' && this.state.seqMatches.unmatchedSeqs.length === 0) {
            return this.renderAutoCompleteView();
        }
        // Show full manual interface for manual mode or auto with unmatched
        return this.renderManualInterface();
    }
}

export default MapFile;
