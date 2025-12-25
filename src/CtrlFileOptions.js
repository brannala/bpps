import React, { Component } from "react";
import "./CtrlFile.css";

class CtrlFileOptions extends Component {
    render() {
        if (this.props.mapData.size > 0) {
            const { speciesDelim, speciesTreeInf, diploid } = this.props.ctrlFileOpts;

            return (
                <div className="options-flat">
                    <div className="options-header">Analysis</div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Species</span>
                        <div className="segmented-control">
                            <button
                                type="button"
                                className={`segment ${!speciesDelim ? 'segment-active' : ''}`}
                                onClick={() => speciesDelim && this.props.handleSpecDelimCheckbox()}
                            >
                                Fixed
                            </button>
                            <button
                                type="button"
                                className={`segment ${speciesDelim ? 'segment-active' : ''}`}
                                onClick={() => !speciesDelim && this.props.handleSpecDelimCheckbox()}
                            >
                                Delimit
                            </button>
                        </div>
                    </div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Tree</span>
                        <div className="segmented-control">
                            <button
                                type="button"
                                className={`segment ${!speciesTreeInf ? 'segment-active' : ''}`}
                                onClick={() => speciesTreeInf && this.props.handleSpecTreeInfCheckbox()}
                            >
                                Provided
                            </button>
                            <button
                                type="button"
                                className={`segment ${speciesTreeInf ? 'segment-active' : ''}`}
                                onClick={() => !speciesTreeInf && this.props.handleSpecTreeInfCheckbox()}
                            >
                                Infer
                            </button>
                        </div>
                    </div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Data</span>
                        <div className="segmented-control">
                            <button
                                type="button"
                                className={`segment ${!diploid ? 'segment-active' : ''}`}
                                onClick={() => diploid && this.props.handleDiploidCheckbox()}
                            >
                                Unphased
                            </button>
                            <button
                                type="button"
                                className={`segment ${diploid ? 'segment-active' : ''}`}
                                onClick={() => !diploid && this.props.handleDiploidCheckbox()}
                            >
                                Phased
                            </button>
                        </div>
                    </div>

                    <div className="options-header">Topology</div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Starting tree</span>
                        <button
                            type="button"
                            className="topology-button"
                            onClick={this.props.handleRandomTopology}
                            disabled={this.props.speciesList.length < 2}
                        >
                            Randomize
                        </button>
                    </div>

                    <div className="options-header">MCMC</div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Burn-in</span>
                        <input
                            onChange={this.props.handleBurninSet}
                            name="burnin"
                            type="number"
                            min="1"
                            value={this.props.ctrlFileOpts.burnin}
                            className="option-input-flat"
                        />
                    </div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Sample frequency</span>
                        <input
                            onChange={this.props.handleSampleFreqSet}
                            name="sfreq"
                            type="number"
                            min="1"
                            value={this.props.ctrlFileOpts.sampleFreq}
                            className="option-input-flat option-input-small"
                        />
                    </div>

                    <div className="option-row-flat">
                        <span className="option-label-flat">Samples</span>
                        <input
                            onChange={this.props.handleMcmcSamples}
                            name="mcmc"
                            type="number"
                            min="1"
                            value={this.props.ctrlFileOpts.mcmcSamples}
                            className="option-input-flat"
                        />
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default CtrlFileOptions;
