import React, { Component } from "react";
import "./CtrlFile.css";
import MigrationSection from "./MigrationSection";
import IntrogressionSection from "./IntrogressionSection";
import TopologyEditor from "./TopologyEditor";

class CtrlFileOptions extends Component {
    render() {
        if (this.props.mapData.size > 0) {
            const { speciesDelim, speciesTreeInf, diploid } = this.props.ctrlFileOpts;
            const { analysisExpanded, topologyExpanded, mcmcExpanded } = this.props;

            return (
                <div className="options-flat">
                    {/* Analysis Section - Collapsible */}
                    <div
                        className="section-header"
                        onClick={this.props.handleAnalysisSectionToggle}
                    >
                        <span className="options-header" style={{ padding: 0, border: 'none', marginBottom: 0 }}>
                            Analysis
                        </span>
                        <span className={`section-toggle-icon ${analysisExpanded ? 'expanded' : ''}`}>
                            &#9660;
                        </span>
                    </div>

                    {analysisExpanded && (
                        <div className="section-content">
                            <div className="option-row-inline">
                                <div className="option-group-inline">
                                    <span className="option-label-inline">Species</span>
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

                                <div className="option-group-inline">
                                    <span className="option-label-inline">Tree</span>
                                    <div className="segmented-control">
                                        <button
                                            type="button"
                                            className={`segment ${!speciesTreeInf ? 'segment-active' : ''}`}
                                            onClick={() => speciesTreeInf && this.props.handleSpecTreeInfCheckbox()}
                                        >
                                            Fixed
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

                                <div className="option-group-inline">
                                    <span className="option-label-inline">Data</span>
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
                            </div>

                            <div className="option-row-inline" style={{ marginTop: '12px' }}>
                                <div className="option-group-inline">
                                    <span className="option-label-inline">Seed</span>
                                    <input
                                        onChange={this.props.handleSeedSet}
                                        name="seed"
                                        type="number"
                                        value={this.props.ctrlFileOpts.seed}
                                        className="option-input-flat option-input-small"
                                        title="Random seed (-1 for random)"
                                    />
                                </div>

                                <div className="option-group-inline">
                                    <span className="option-label-inline">Job name</span>
                                    <input
                                        onChange={this.props.handleJobnameSet}
                                        name="jobname"
                                        type="text"
                                        value={this.props.ctrlFileOpts.jobname}
                                        className="option-input-flat"
                                        title="Output file prefix"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Topology Section - Collapsible */}
                    <div
                        className="section-header"
                        onClick={this.props.handleTopologySectionToggle}
                    >
                        <span className="options-header" style={{ padding: 0, border: 'none', marginBottom: 0 }}>
                            Topology
                        </span>
                        <span className={`section-toggle-icon ${topologyExpanded ? 'expanded' : ''}`}>
                            &#9660;
                        </span>
                    </div>

                    {topologyExpanded && (
                        <div className="section-content">
                            <TopologyEditor
                                speciesList={this.props.speciesList}
                                treeObject={this.props.treeObject}
                                treeEditMode={this.props.treeEditMode}
                                sprSelectedNode={this.props.sprSelectedNode}
                                newickInput={this.props.newickInput}
                                newickError={this.props.newickError}
                                nTree={this.props.nTree}
                                handleRandomTopology={this.props.handleRandomTopology}
                                handleToggleTreeEditMode={this.props.handleToggleTreeEditMode}
                                handleSprNodeClick={this.props.handleSprNodeClick}
                                handleCancelSpr={this.props.handleCancelSpr}
                                handleNewickInputChange={this.props.handleNewickInputChange}
                                handleApplyNewick={this.props.handleApplyNewick}
                            />
                        </div>
                    )}

                    {/* Migration (MSC-M) Section */}
                    <MigrationSection
                        speciesList={this.props.speciesList}
                        treeObject={this.props.treeObject}
                        allNodeNames={this.props.allNodeNames}
                        migrationConfig={this.props.migrationConfig}
                        migrationExpanded={this.props.migrationExpanded}
                        ctrlFileOpts={this.props.ctrlFileOpts}
                        handleToggleMigration={this.props.handleToggleMigration}
                        handleUpdateMigrationRoutes={this.props.handleUpdateMigrationRoutes}
                        handleUpdateWprior={this.props.handleUpdateWprior}
                        handleMigrationSectionToggle={this.props.handleMigrationSectionToggle}
                    />

                    {/* Introgression (MSC-I) Section */}
                    <IntrogressionSection
                        speciesList={this.props.speciesList}
                        treeObject={this.props.treeObject}
                        allNodeNames={this.props.allNodeNames}
                        introgressionConfig={this.props.introgressionConfig}
                        introgressionExpanded={this.props.introgressionExpanded}
                        ctrlFileOpts={this.props.ctrlFileOpts}
                        migrationConfig={this.props.migrationConfig}
                        labeledNewick={this.props.labeledNewick}
                        handleToggleIntrogression={this.props.handleToggleIntrogression}
                        handleUpdateIntrogressionEvents={this.props.handleUpdateIntrogressionEvents}
                        handleIntrogressionSectionToggle={this.props.handleIntrogressionSectionToggle}
                        handleUpdateExtendedNewick={this.props.handleUpdateExtendedNewick}
                        handleUpdatePhiprior={this.props.handleUpdatePhiprior}
                    />

                    {/* MCMC Section - Collapsible */}
                    <div
                        className="section-header"
                        onClick={this.props.handleMcmcSectionToggle}
                    >
                        <span className="options-header" style={{ padding: 0, border: 'none', marginBottom: 0 }}>
                            MCMC
                        </span>
                        <span className={`section-toggle-icon ${mcmcExpanded ? 'expanded' : ''}`}>
                            &#9660;
                        </span>
                    </div>

                    {mcmcExpanded && (
                        <div className="section-content">
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
                    )}
                </div>
            );
        } else {
            return null;
        }
    }
}

export default CtrlFileOptions;
