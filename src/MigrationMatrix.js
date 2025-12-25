import React, { Component } from "react";
import { areContemporaneous } from "./Trees";

class MigrationMatrix extends Component {
    // Check if a route exists
    hasRoute(source, target) {
        return this.props.migrationRoutes.some(
            r => r.source === source && r.target === target
        );
    }

    // Toggle a migration route
    handleCellClick(source, target) {
        const existingRoutes = this.props.migrationRoutes;
        const existingIndex = existingRoutes.findIndex(
            r => r.source === source && r.target === target
        );

        let newRoutes;
        if (existingIndex >= 0) {
            // Remove the route
            newRoutes = existingRoutes.filter((_, i) => i !== existingIndex);
        } else {
            // Add the route
            newRoutes = [...existingRoutes, { source, target }];
        }

        this.props.onUpdateRoutes(newRoutes);
    }

    render() {
        const { speciesList, allNodeNames, treeObject } = this.props;

        // Use all nodes (tips + internal) if available, otherwise fall back to speciesList
        const nodeList = (allNodeNames && allNodeNames.all && allNodeNames.all.length > 0)
            ? allNodeNames.all
            : speciesList;

        if (!nodeList || nodeList.length < 2) {
            return <div className="matrix-empty">Need at least 2 species</div>;
        }

        return (
            <div className="migration-matrix-container">
                <table className="migration-matrix">
                    <thead>
                        <tr>
                            <th className="matrix-corner">
                                <span className="matrix-from-label">From ↓</span>
                                <span className="matrix-to-label">To →</span>
                            </th>
                            {nodeList.map(node => (
                                <th key={node} className="matrix-header-cell">
                                    {node}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {nodeList.map(source => (
                            <tr key={source}>
                                <td className="matrix-row-header">{source}</td>
                                {nodeList.map(target => {
                                    const isSelf = source === target;
                                    const isActive = this.hasRoute(source, target);
                                    // Check if this pair is valid (contemporaneous)
                                    const isValid = !isSelf && treeObject && areContemporaneous(source, target, treeObject);
                                    const isDisabled = isSelf || !isValid;

                                    return (
                                        <td
                                            key={target}
                                            className={`matrix-cell ${isDisabled ? 'matrix-cell-disabled' : ''} ${isActive ? 'matrix-cell-active' : ''}`}
                                            onClick={() => !isDisabled && this.handleCellClick(source, target)}
                                            title={!isValid && !isSelf ? 'Invalid: populations not contemporaneous' : ''}
                                        >
                                            {isSelf ? (
                                                <span className="matrix-cell-dash">—</span>
                                            ) : !isValid ? (
                                                <span className="matrix-cell-dash">×</span>
                                            ) : (
                                                <span className={`matrix-cell-check ${isActive ? 'active' : ''}`}>
                                                    {isActive ? '✓' : ''}
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default MigrationMatrix;
