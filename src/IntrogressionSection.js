import React, { Component } from "react";
import TreeVisualizer from "./TreeVisualizer";
import { generateExtendedNewickFromString, areContemporaneous } from "./Trees";
import "./CtrlFile.css";

class IntrogressionSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newSource: '',
            newTarget: '',
            newickError: null
        };
        this.handleAddEvent = this.handleAddEvent.bind(this);
        this.handleRemoveEvent = this.handleRemoveEvent.bind(this);
        this.handleNewickChange = this.handleNewickChange.bind(this);
        this.handlePhiAlphaChange = this.handlePhiAlphaChange.bind(this);
        this.handlePhiBetaChange = this.handlePhiBetaChange.bind(this);
        this.handleRegenerateNewick = this.handleRegenerateNewick.bind(this);
    }

    handleRegenerateNewick() {
        const { introgressionConfig, handleUpdateExtendedNewick, labeledNewick } = this.props;
        const baseNewick = labeledNewick || '';
        if (baseNewick) {
            if (introgressionConfig.events.length > 0) {
                const extendedNewick = generateExtendedNewickFromString(baseNewick, introgressionConfig.events, 0.5);
                handleUpdateExtendedNewick(extendedNewick);
            } else {
                handleUpdateExtendedNewick(baseNewick + ';');
            }
        }
    }

    handleAddEvent() {
        const { newSource, newTarget } = this.state;
        const { introgressionConfig, handleUpdateIntrogressionEvents, handleUpdateExtendedNewick, labeledNewick } = this.props;

        if (!newSource || !newTarget || newSource === newTarget) return;

        // Check if this event already exists
        const exists = introgressionConfig.events.some(
            e => e.source === newSource && e.target === newTarget
        );
        if (exists) return;

        const newEvents = [
            ...introgressionConfig.events,
            { source: newSource, target: newTarget }
        ];
        handleUpdateIntrogressionEvents(newEvents);

        // Generate extended Newick with hybrid annotations
        const baseNewick = labeledNewick || '';
        if (baseNewick) {
            const extendedNewick = generateExtendedNewickFromString(baseNewick, newEvents, 0.5);
            handleUpdateExtendedNewick(extendedNewick);
        }

        // Reset form
        this.setState({ newSource: '', newTarget: '' });
    }

    handleRemoveEvent(index) {
        const { introgressionConfig, handleUpdateIntrogressionEvents, handleUpdateExtendedNewick, labeledNewick } = this.props;
        const newEvents = introgressionConfig.events.filter((_, i) => i !== index);
        handleUpdateIntrogressionEvents(newEvents);

        // Regenerate extended Newick
        const baseNewick = labeledNewick || '';
        if (baseNewick) {
            if (newEvents.length > 0) {
                const extendedNewick = generateExtendedNewickFromString(baseNewick, newEvents, 0.5);
                handleUpdateExtendedNewick(extendedNewick);
            } else {
                // No events left, reset to base tree
                handleUpdateExtendedNewick(baseNewick + ';');
            }
        }
    }

    handleNewickChange(e) {
        this.props.handleUpdateExtendedNewick(e.target.value);
        this.setState({ newickError: null });
    }

    handlePhiAlphaChange(e) {
        const alpha = parseFloat(e.target.value) || 1;
        this.props.handleUpdatePhiprior(alpha, this.props.introgressionConfig.phiprior.beta);
    }

    handlePhiBetaChange(e) {
        const beta = parseFloat(e.target.value) || 1;
        this.props.handleUpdatePhiprior(this.props.introgressionConfig.phiprior.alpha, beta);
    }

    initializeNewick() {
        const { introgressionConfig, handleUpdateExtendedNewick, labeledNewick } = this.props;
        if (!introgressionConfig.extendedNewick && labeledNewick) {
            handleUpdateExtendedNewick(labeledNewick + ';');
        }
    }

    componentDidUpdate(prevProps) {
        // Initialize extended Newick when introgression is enabled
        if (this.props.introgressionConfig.enabled && !prevProps.introgressionConfig.enabled) {
            this.initializeNewick();
        }
    }

    render() {
        const {
            introgressionConfig,
            introgressionExpanded,
            speciesList,
            treeObject,
            ctrlFileOpts,
            migrationConfig,
            labeledNewick
        } = this.props;

        const hasEnoughSpecies = speciesList && speciesList.length >= 2;
        // Use all node names (tips + internal) for dropdown to allow ancestral introgression
        const { allNodeNames } = this.props;
        const branchNames = (allNodeNames && allNodeNames.all && allNodeNames.all.length > 0)
            ? allNodeNames.all
            : speciesList || [];

        // For tree visualization, show introgression as dashed arrows
        const introgressionRoutes = introgressionConfig.events.map(e => ({
            source: e.source,
            target: e.target
        }));

        return (
            <div className="introgression-section">
                {/* Collapsible header */}
                <div
                    className="section-header"
                    onClick={this.props.handleIntrogressionSectionToggle}
                >
                    <span className="options-header" style={{ padding: 0, border: 'none', marginBottom: 0 }}>
                        Introgression (MSC-I)
                    </span>
                    <span className={`section-toggle-icon ${introgressionExpanded ? 'expanded' : ''}`}>
                        &#9660;
                    </span>
                </div>

                {/* Collapsible content */}
                {introgressionExpanded && (
                    <div className="section-content">
                        {/* Enable/disable toggle */}
                        <div className="option-row-flat">
                            <span className="option-label-flat">Enable introgression</span>
                            <div className="segmented-control">
                                <button
                                    type="button"
                                    className={`segment ${!introgressionConfig.enabled ? 'segment-active' : ''}`}
                                    onClick={() => introgressionConfig.enabled && this.props.handleToggleIntrogression()}
                                    disabled={!hasEnoughSpecies}
                                >
                                    Off
                                </button>
                                <button
                                    type="button"
                                    className={`segment ${introgressionConfig.enabled ? 'segment-active' : ''}`}
                                    onClick={() => !introgressionConfig.enabled && this.props.handleToggleIntrogression()}
                                    disabled={!hasEnoughSpecies}
                                >
                                    On
                                </button>
                            </div>
                        </div>

                        {/* Warnings */}
                        {migrationConfig?.enabled && !introgressionConfig.enabled && hasEnoughSpecies && (
                            <div className="migration-warning">
                                <span className="warning-icon">!</span>
                                <span>Migration (MSC-M) is enabled. Enabling introgression will disable migration.</span>
                            </div>
                        )}

                        {!introgressionConfig.enabled && hasEnoughSpecies &&
                         (ctrlFileOpts.speciesTreeInf || ctrlFileOpts.speciesDelim) && (
                            <div className="migration-warning">
                                <span className="warning-icon">!</span>
                                <span>Introgression requires fixed species and tree. Enabling will switch to A00 mode.</span>
                            </div>
                        )}

                        {/* Main introgression editor */}
                        {introgressionConfig.enabled && hasEnoughSpecies && (
                            <div className="introgression-editor">
                                {/* Tree visualization */}
                                {treeObject && (
                                    <div className="migration-tree-container">
                                        <div className="migration-tree-label">Species tree with introgression:</div>
                                        <TreeVisualizer
                                            key={`intro-tree-${JSON.stringify(introgressionRoutes)}`}
                                            speciesList={speciesList}
                                            treeObject={treeObject}
                                            migrationRoutes={introgressionRoutes}
                                            arrowStyle="introgression"
                                        />
                                    </div>
                                )}

                                {/* Event selector for guidance */}
                                <div className="introgression-events">
                                    <div className="introgression-events-label">
                                        Introgression events (for reference):
                                    </div>

                                    {introgressionConfig.events.length > 0 && (
                                        <div className="introgression-event-list">
                                            {introgressionConfig.events.map((event, index) => (
                                                <div key={index} className="introgression-event-row">
                                                    <span className="introgression-event-desc">
                                                        {event.source} → {event.target}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="introgression-remove-btn"
                                                        onClick={() => this.handleRemoveEvent(index)}
                                                        title="Remove event"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="introgression-add-form">
                                        <select
                                            className="introgression-select"
                                            value={this.state.newSource}
                                            onChange={(e) => this.setState({ newSource: e.target.value })}
                                        >
                                            <option value="">Source...</option>
                                            {branchNames.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <span className="introgression-arrow">→</span>
                                        <select
                                            className="introgression-select"
                                            value={this.state.newTarget}
                                            onChange={(e) => this.setState({ newTarget: e.target.value })}
                                        >
                                            <option value="">Target...</option>
                                            {branchNames
                                                .filter(n => n !== this.state.newSource)
                                                .filter(n => !this.state.newSource || !treeObject || areContemporaneous(this.state.newSource, n, treeObject))
                                                .map(name => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="smallButton"
                                            onClick={this.handleAddEvent}
                                            disabled={!this.state.newSource || !this.state.newTarget}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Extended Newick input */}
                                <div className="extended-newick-section">
                                    <div className="extended-newick-header">
                                        <div className="extended-newick-label">
                                            Extended Newick (with hybrid nodes):
                                        </div>
                                        <button
                                            type="button"
                                            className="smallButton"
                                            onClick={this.handleRegenerateNewick}
                                            title="Regenerate from events list"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                    <div className="extended-newick-help">
                                        Auto-generated from events. Format: <code>(B)H[&phi=0.5,&tau-parent=no]</code> and <code>H[&tau-parent=yes]</code>
                                    </div>
                                    <textarea
                                        className="extended-newick-input"
                                        value={introgressionConfig.extendedNewick || labeledNewick + ';' || ''}
                                        onChange={this.handleNewickChange}
                                        placeholder="Enter extended Newick with hybrid annotations..."
                                        rows={4}
                                    />
                                    {this.state.newickError && (
                                        <div className="newick-error">{this.state.newickError}</div>
                                    )}
                                </div>

                                {/* Phi prior */}
                                <div className="phiprior-section">
                                    <div className="phiprior-label">Phi prior: Beta(α, β)</div>
                                    <div className="phiprior-row">
                                        <label className="phiprior-param-label">α:</label>
                                        <input
                                            type="number"
                                            className="phiprior-input"
                                            value={introgressionConfig.phiprior.alpha}
                                            onChange={this.handlePhiAlphaChange}
                                            min="0.01"
                                            step="0.1"
                                        />
                                        <label className="phiprior-param-label">β:</label>
                                        <input
                                            type="number"
                                            className="phiprior-input"
                                            value={introgressionConfig.phiprior.beta}
                                            onChange={this.handlePhiBetaChange}
                                            min="0.01"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="phiprior-note">
                                        Beta(1,1) = uniform prior on [0,1]
                                    </div>
                                </div>
                            </div>
                        )}

                        {!hasEnoughSpecies && (
                            <div className="migration-info">
                                Load a map file with at least 2 species to configure introgression.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default IntrogressionSection;
