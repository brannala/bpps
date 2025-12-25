import React, { Component } from "react";
import './DisplaySeqs.css';
import DisplaySeqs from "./DisplaySeqs";
import GetFile from "./GetFile";
import { detectFormat, convertToBpp, downloadAsFile } from "./FormatConvert";
import { ErrorBanner } from "./ErrorMessage";

class Sequences extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posInLocusArray: 0,
            showConvertDialog: false,
            pendingConversion: null,
            convertedText: '',
            outputFileName: 'sequences.txt',
            fileError: null
        };
        this.clearError = this.clearError.bind(this);
        this.initPosInLocusArray = this.initPosInLocusArray.bind(this);
        this.handleScanClickUp = this.handleScanClickUp.bind(this);
        this.handleScanClickDown = this.handleScanClickDown.bind(this);
        this.handleLocusSelect = this.handleLocusSelect.bind(this);
        this.handleFileRead = this.handleFileRead.bind(this);
        this.handleConvertConfirm = this.handleConvertConfirm.bind(this);
        this.handleConvertCancel = this.handleConvertCancel.bind(this);
        this.handleOutputFileNameChange = this.handleOutputFileNameChange.bind(this);
    }

    clearError() {
        this.setState({ fileError: null });
    }

    handleFileRead(fileContents, fileName) {
        // Clear any previous error
        this.setState({ fileError: null });

        const format = detectFormat(fileContents);

        if (format === 'bpp') {
            // Already in BPP format, process normally
            this.props.readFile(fileContents, fileName);
        } else if (format === 'fasta' || format === 'nexus') {
            // Need conversion - show dialog
            const result = convertToBpp(fileContents, format);
            if (result.error) {
                this.setState({ fileError: result.error });
                return;
            }
            // Generate default output filename
            const baseName = fileName.replace(/\.[^/.]+$/, '');
            this.setState({
                showConvertDialog: true,
                pendingConversion: { format, originalName: fileName },
                convertedText: result.text,
                outputFileName: `${baseName}_bpp.txt`
            });
        } else {
            this.setState({ fileError: 'Unknown file format. Please use FASTA, NEXUS, or BPP format.' });
        }
    }

    handleConvertConfirm() {
        // Save to local variables before any state changes
        const text = this.state.convertedText;
        const fileName = this.state.outputFileName;

        // Close dialog first
        this.setState({
            showConvertDialog: false,
            pendingConversion: null,
            convertedText: '',
            posInLocusArray: 0
        });

        // Download the converted file
        downloadAsFile(text, fileName);

        // Process the converted text and load into viewer
        this.props.readFile(text, fileName);
    }

    handleConvertCancel() {
        this.setState({
            showConvertDialog: false,
            pendingConversion: null,
            convertedText: ''
        });
    }

    handleOutputFileNameChange(e) {
        this.setState({ outputFileName: e.target.value });
    }

    // callback passed to GetSeqFile. Set posInLocusArray to 0 when new file is read.
    initPosInLocusArray() { this.setState(()=>({ posInLocusArray: 0 })); }

    // callback increments posInLocusArray index when next button pressed.
    handleScanClickUp(e) {
        if(this.state.posInLocusArray < this.props.locusArray.length-1) {
            this.setState(()=>({ posInLocusArray: this.state.posInLocusArray + 1 }));
        }
    }

    // callback decrements posInLocusArray index when prev button pressed.
    handleScanClickDown(e) {
        if(this.state.posInLocusArray > 0) {
            this.setState({ posInLocusArray: this.state.posInLocusArray-1 });
        }
    }

    // callback for dropdown selection
    handleLocusSelect(e) {
        this.setState({ posInLocusArray: parseInt(e.target.value, 10) });
    }

    render() {
        const hasLoci = this.props.locusArray.length > 0;
        const currentLocus = this.state.posInLocusArray;
        const totalLoci = this.props.locusArray.length;
        const hasPrev = currentLocus > 0;
        const hasNext = currentLocus < totalLoci - 1;

        return (
            <div>
              {this.state.showConvertDialog && (
                <div className="convert-dialog-overlay">
                  <div className="convert-dialog">
                    <h3>Convert to BPP Format</h3>
                    <p>
                      The file <strong>{this.state.pendingConversion?.originalName}</strong> is in {this.state.pendingConversion?.format.toUpperCase()} format.
                    </p>
                    <p>It will be converted to BPP format and saved as:</p>
                    <input
                      type="text"
                      value={this.state.outputFileName}
                      onChange={this.handleOutputFileNameChange}
                      className="convert-filename-input"
                    />
                    <div className="convert-dialog-buttons">
                      <button className="convert-btn convert-btn-primary" onClick={this.handleConvertConfirm}>
                        Convert & Save
                      </button>
                      <button className="convert-btn convert-btn-secondary" onClick={this.handleConvertCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="seqview">
                <h2>Step 1: Load Sequences</h2>
                <GetFile readFile={this.handleFileRead} initPosInLocusArray={this.initPosInLocusArray} fileType={"sequence"}/>
                <ErrorBanner message={this.state.fileError || this.props.parseError} onDismiss={this.clearError} />

                {hasLoci && (
                  <DisplaySeqs locusText={this.props.locusArray[this.state.posInLocusArray]} />
                )}

                {hasLoci && (
                  <div className="locus-navigator">
                    <div className="locus-nav-controls">
                      <button
                        className="nav-arrow"
                        onClick={this.handleScanClickDown}
                        disabled={!hasPrev}
                        title="Previous locus"
                      >
                        &#8249;
                      </button>

                      <div className="locus-selector">
                        <span className="locus-label">Locus</span>
                        <select
                          value={currentLocus}
                          onChange={this.handleLocusSelect}
                          className="locus-dropdown"
                        >
                          {this.props.locusArray.map((_, index) => (
                            <option key={index} value={index}>
                              {index + 1}
                            </option>
                          ))}
                        </select>
                        <span className="locus-total">of {totalLoci}</span>
                      </div>

                      <button
                        className="nav-arrow"
                        onClick={this.handleScanClickUp}
                        disabled={!hasNext}
                        title="Next locus"
                      >
                        &#8250;
                      </button>
                    </div>

                    <div className="locus-stats">
                      <span className="stat-item">
                        <span className="stat-label">Sequences:</span>
                        <span className="stat-value">
                          {(this.props.locusCounts !== undefined) && (this.props.locusCounts.length !== 0)
                            ? this.props.locusCounts[currentLocus].noseqs
                            : "0"}
                        </span>
                      </span>
                      <span className="stat-item">
                        <span className="stat-label">Sites:</span>
                        <span className="stat-value">
                          {(this.props.locusCounts !== undefined) && (this.props.locusCounts.length !== 0)
                            ? this.props.locusCounts[currentLocus].nosites
                            : "0"}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
        );
    }
}

export default Sequences;
