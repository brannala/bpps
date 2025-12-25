import React, { Component } from "react";
import "./Mapfile.css";

class DisplayUnmatchedSeqs extends Component {
    constructor(props) {
        super(props);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    handleItemClick(seqName, index, event) {
        // Prevent double-firing if clicking directly on checkbox
        if (event.target.type === 'checkbox') return;

        const { selectedSeqs, onSelectionChange, lastSelectedIndex } = this.props;
        const unmatchedSeqs = this.props.seqMatches.unmatchedSeqs;

        if (event.shiftKey && lastSelectedIndex !== null) {
            // Shift+click: select range
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelected = new Set(selectedSeqs);
            for (let i = start; i <= end; i++) {
                newSelected.add(unmatchedSeqs[i]);
            }
            onSelectionChange(newSelected, index);
        } else if (event.ctrlKey || event.metaKey) {
            // Ctrl/Cmd+click: toggle individual
            const newSelected = new Set(selectedSeqs);
            if (newSelected.has(seqName)) {
                newSelected.delete(seqName);
            } else {
                newSelected.add(seqName);
            }
            onSelectionChange(newSelected, index);
        } else {
            // Regular click: toggle single item
            const newSelected = new Set(selectedSeqs);
            if (newSelected.has(seqName)) {
                newSelected.delete(seqName);
            } else {
                newSelected.add(seqName);
            }
            onSelectionChange(newSelected, index);
        }
    }

    handleCheckboxChange(seqName, index, event) {
        const { selectedSeqs, onSelectionChange } = this.props;
        const newSelected = new Set(selectedSeqs);

        if (event.target.checked) {
            newSelected.add(seqName);
        } else {
            newSelected.delete(seqName);
        }
        onSelectionChange(newSelected, index);
    }

    render() {
        const { seqMatches, selectedSeqs, onSelectAll, onSelectNone } = this.props;
        const unmatchedSeqs = seqMatches.unmatchedSeqs;
        const selectedCount = selectedSeqs ? selectedSeqs.size : 0;

        return (
            <div>
              <div className="title">
                <p>Sequence names ({unmatchedSeqs.length})</p>
              </div>
              <div className="selection-buttons">
                <button
                    type="button"
                    className="smallButton"
                    onClick={onSelectAll}
                    disabled={unmatchedSeqs.length === 0}
                >
                    Select All
                </button>
                <button
                    type="button"
                    className="smallButton"
                    onClick={onSelectNone}
                    disabled={selectedCount === 0}
                    style={{marginLeft: '5px'}}
                >
                    Clear
                </button>
                {selectedCount > 0 && (
                    <span className="selection-count">
                        {selectedCount} selected
                    </span>
                )}
              </div>
              <div className="col2">
                <div className="seq-list-container">
                    {unmatchedSeqs.map((seqName, index) => (
                        <div
                            key={seqName}
                            className={`seq-list-item ${selectedSeqs && selectedSeqs.has(seqName) ? 'selected' : ''}`}
                            onClick={(e) => this.handleItemClick(seqName, index, e)}
                        >
                            <input
                                type="checkbox"
                                checked={selectedSeqs ? selectedSeqs.has(seqName) : false}
                                onChange={(e) => this.handleCheckboxChange(seqName, index, e)}
                                className="seq-checkbox"
                            />
                            <span className="seq-name">{seqName}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
        );
    }
}

export default DisplayUnmatchedSeqs;
