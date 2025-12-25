import React, { Component } from "react";
import TreeVisualizerSPR from "./TreeVisualizerSPR";

class TopologyEditor extends Component {
    render() {
        const {
            speciesList,
            treeObject,
            treeEditMode,
            sprSelectedNode,
            newickInput,
            newickError,
            nTree,
            handleRandomTopology,
            handleToggleTreeEditMode,
            handleSprNodeClick,
            handleCancelSpr,
            handleNewickInputChange,
            handleApplyNewick
        } = this.props;

        const hasSpecies = speciesList && speciesList.length >= 2;

        return (
            <div className="topology-editor">
                {/* Button row */}
                <div className="topology-button-row">
                    <button
                        type="button"
                        className="topology-button"
                        onClick={handleRandomTopology}
                        disabled={!hasSpecies}
                    >
                        Randomize
                    </button>
                    <button
                        type="button"
                        className={`topology-button ${treeEditMode ? 'topology-button-active' : ''}`}
                        onClick={handleToggleTreeEditMode}
                        disabled={!hasSpecies}
                    >
                        {treeEditMode ? 'Done Editing' : 'Edit Tree'}
                    </button>
                </div>

                {/* SPR mode instructions */}
                {treeEditMode && (
                    <div className="spr-instructions">
                        {sprSelectedNode ? (
                            <>
                                <span className="spr-status">
                                    Selected: <strong>{sprSelectedNode}</strong> — Click target branch to attach, or
                                </span>
                                <button
                                    type="button"
                                    className="topology-button-small"
                                    onClick={handleCancelSpr}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <span className="spr-status">Click a node to select subtree for SPR move</span>
                        )}
                    </div>
                )}

                {/* Tree visualizer with SPR support */}
                {hasSpecies && treeObject && (
                    <TreeVisualizerSPR
                        speciesList={speciesList}
                        treeObject={treeObject}
                        treeEditMode={treeEditMode}
                        sprSelectedNode={sprSelectedNode}
                        onNodeClick={handleSprNodeClick}
                        migrationRoutes={[]}
                    />
                )}

                {/* Error message */}
                {newickError && (
                    <div className="newick-error">{newickError}</div>
                )}

                {/* Newick input */}
                {hasSpecies && (
                    <div className="newick-input-section">
                        <div className="newick-input-label">Or enter Newick string:</div>
                        <div className="newick-input-row">
                            <input
                                type="text"
                                className="newick-input"
                                value={newickInput || nTree || ''}
                                onChange={handleNewickInputChange}
                                placeholder="((A, B), C)"
                            />
                            <button
                                type="button"
                                className="topology-button"
                                onClick={handleApplyNewick}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {!hasSpecies && (
                    <div className="topology-info">
                        Load a map file with at least 2 species to edit topology.
                    </div>
                )}
            </div>
        );
    }
}

export default TopologyEditor;
