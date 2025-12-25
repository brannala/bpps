import React, { Component } from "react";
import "./Mapfile.css";

class DisplayMatchedSeqs extends Component {
    render() {
        const { matchedSeqs } = this.props.seqMatches;

        if (!matchedSeqs || matchedSeqs.length === 0) {
            return (
                <div className="species-groups-empty">
                    No sequences assigned yet
                </div>
            );
        }

        return (
            <div className="species-groups">
                <div className="species-groups-header">Assigned Species</div>
                {matchedSeqs.map((group, index) => (
                    <div key={index} className="species-card">
                        <div className="species-card-header">
                            <span className="species-card-name">{group.spName}</span>
                            <span className="species-card-count">{group.seqNames.length}</span>
                        </div>
                        <div className="species-tree">
                            {group.seqNames.map((seqName, seqIndex) => (
                                <div key={seqIndex} className="tree-node">
                                    <span className="tree-branch"></span>
                                    <span className="tree-label" title={seqName}>{seqName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default DisplayMatchedSeqs;
