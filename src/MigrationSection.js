import React, { Component } from "react";
import MigrationMatrix from "./MigrationMatrix";
import RouteDisplay from "./RouteDisplay";
import TreeVisualizer from "./TreeVisualizer";
import "./CtrlFile.css";

class MigrationSection extends Component {
    constructor(props) {
        super(props);
        this.handleAlphaChange = this.handleAlphaChange.bind(this);
        this.handleBetaChange = this.handleBetaChange.bind(this);
    }

    handleAlphaChange(e) {
        const alpha = parseFloat(e.target.value) || 0;
        this.props.handleUpdateWprior(alpha, this.props.migrationConfig.wprior.beta);
    }

    handleBetaChange(e) {
        const beta = parseFloat(e.target.value) || 0;
        this.props.handleUpdateWprior(this.props.migrationConfig.wprior.alpha, beta);
    }

    render() {
        const { migrationConfig, migrationExpanded, speciesList, treeObject } = this.props;
        const hasEnoughSpecies = speciesList && speciesList.length >= 2;

        return (
            <div className="migration-section">
                {/* Collapsible header */}
                <div
                    className="migration-header"
                    onClick={this.props.handleMigrationSectionToggle}
                >
                    <span className="options-header" style={{ padding: 0, border: 'none', marginBottom: 0 }}>
                        Migration (MSC-M)
                    </span>
                    <span className={`migration-toggle-icon ${migrationExpanded ? 'expanded' : ''}`}>
                        &#9660;
                    </span>
                </div>

                {/* Collapsible content */}
                {migrationExpanded && (
                    <div className="migration-content">
                        {/* Tree visualization - always shown when we have species */}
                        {hasEnoughSpecies && (
                            <div className="migration-tree-container">
                                <div className="migration-tree-label">Species tree:</div>
                                <TreeVisualizer
                                    speciesList={speciesList}
                                    treeObject={treeObject}
                                    migrationRoutes={migrationConfig.routes}
                                />
                            </div>
                        )}

                        {/* Enable/disable toggle */}
                        <div className="option-row-flat">
                            <span className="option-label-flat">Enable migration</span>
                            <div className="segmented-control">
                                <button
                                    type="button"
                                    className={`segment ${!migrationConfig.enabled ? 'segment-active' : ''}`}
                                    onClick={() => migrationConfig.enabled && this.props.handleToggleMigration()}
                                    disabled={!hasEnoughSpecies}
                                >
                                    Off
                                </button>
                                <button
                                    type="button"
                                    className={`segment ${migrationConfig.enabled ? 'segment-active' : ''}`}
                                    onClick={() => !migrationConfig.enabled && this.props.handleToggleMigration()}
                                    disabled={!hasEnoughSpecies}
                                >
                                    On
                                </button>
                            </div>
                        </div>

                        {/* A00 mode warning - show when tree is not fixed and migration is not yet enabled */}
                        {!migrationConfig.enabled && hasEnoughSpecies &&
                         (this.props.ctrlFileOpts.speciesTreeInf || this.props.ctrlFileOpts.speciesDelim) && (
                            <div className="migration-warning">
                                <span className="warning-icon">!</span>
                                <span>Migration requires fixed species and tree. Enabling migration will switch to A00 mode.</span>
                            </div>
                        )}

                        {/* Migration matrix and route display */}
                        {migrationConfig.enabled && hasEnoughSpecies && (
                            <>
                                <div className="migration-matrix-label">
                                    Click cells to toggle migration routes (row → column):
                                </div>
                                <MigrationMatrix
                                    speciesList={speciesList}
                                    allNodeNames={this.props.allNodeNames}
                                    treeObject={treeObject}
                                    migrationRoutes={migrationConfig.routes}
                                    onUpdateRoutes={this.props.handleUpdateMigrationRoutes}
                                />

                                {/* Visual display of selected routes */}
                                <RouteDisplay
                                    speciesList={speciesList}
                                    migrationRoutes={migrationConfig.routes}
                                />

                                {/* wprior inputs */}
                                <div className="wprior-section">
                                    <div className="wprior-label">Migration rate prior: Gamma(α, β)</div>
                                    <div className="wprior-row">
                                        <label className="wprior-param-label">α:</label>
                                        <input
                                            type="number"
                                            className="wprior-input"
                                            value={migrationConfig.wprior.alpha}
                                            onChange={this.handleAlphaChange}
                                            min="0.01"
                                            step="0.1"
                                        />
                                        <label className="wprior-param-label">β:</label>
                                        <input
                                            type="number"
                                            className="wprior-input"
                                            value={migrationConfig.wprior.beta}
                                            onChange={this.handleBetaChange}
                                            min="0.01"
                                            step="1"
                                        />
                                    </div>
                                    <div className="wprior-mean">
                                        Prior mean: {(migrationConfig.wprior.alpha / migrationConfig.wprior.beta).toFixed(4)}
                                    </div>
                                </div>
                            </>
                        )}

                        {!hasEnoughSpecies && (
                            <div className="migration-info">
                                Load a map file with at least 2 species to configure migration.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default MigrationSection;
