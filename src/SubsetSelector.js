import React, { Component } from "react";
import "./SubsetSelector.css";
var FileSaver = require('file-saver');

class SubsetSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'specimens', // 'specimens' or 'loci'
            dropdownOpen: false,
            filterText: '',
            selectedSpecimens: new Set(),
            selectedLoci: new Set(),
        };
        this.dropdownRef = React.createRef();
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.handleModeChange = this.handleModeChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSpecimenToggle = this.handleSpecimenToggle.bind(this);
        this.handleLocusToggle = this.handleLocusToggle.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleSaveSubset = this.handleSaveSubset.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside(event) {
        if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
            this.setState({ dropdownOpen: false });
        }
    }

    toggleDropdown() {
        this.setState(prev => ({ dropdownOpen: !prev.dropdownOpen }));
    }

    handleModeChange(mode) {
        this.setState({ mode, filterText: '' });
    }

    handleFilterChange(e) {
        this.setState({ filterText: e.target.value });
    }

    // Get all unique specimen names from sequence data
    getSpecimenNames() {
        const { sequenceData } = this.props;
        if (!sequenceData || sequenceData.length === 0) return [];

        const names = new Set();
        // Get names from first locus (assume same specimens across loci)
        sequenceData[0].sequences.forEach(seq => {
            names.add(seq.seqname);
        });
        return Array.from(names).sort();
    }

    // Get loci info
    getLociInfo() {
        const { sequenceData } = this.props;
        if (!sequenceData) return [];

        return sequenceData.map((locus, idx) => ({
            index: idx,
            label: `Locus ${idx + 1}`,
            sites: locus.nosites
        }));
    }

    handleSpecimenToggle(name) {
        this.setState(prev => {
            const newSelected = new Set(prev.selectedSpecimens);
            if (newSelected.has(name)) {
                newSelected.delete(name);
            } else {
                newSelected.add(name);
            }
            return { selectedSpecimens: newSelected };
        });
    }

    handleLocusToggle(index) {
        this.setState(prev => {
            const newSelected = new Set(prev.selectedLoci);
            if (newSelected.has(index)) {
                newSelected.delete(index);
            } else {
                newSelected.add(index);
            }
            return { selectedLoci: newSelected };
        });
    }

    handleSelectAll() {
        if (this.state.mode === 'specimens') {
            const allSpecimens = this.getSpecimenNames();
            const allSelected = allSpecimens.length === this.state.selectedSpecimens.size;
            if (allSelected) {
                this.setState({ selectedSpecimens: new Set() });
            } else {
                this.setState({ selectedSpecimens: new Set(allSpecimens) });
            }
        } else {
            const allLoci = this.getLociInfo();
            const allSelected = allLoci.length === this.state.selectedLoci.size;
            if (allSelected) {
                this.setState({ selectedLoci: new Set() });
            } else {
                this.setState({ selectedLoci: new Set(allLoci.map(l => l.index)) });
            }
        }
    }

    generateSubsetBpp() {
        const { sequenceData, seqFileName } = this.props;
        const { mode, selectedSpecimens, selectedLoci } = this.state;

        if (!sequenceData || sequenceData.length === 0) return null;

        let outputLines = [];
        let lociToInclude;
        let specimensToInclude;

        if (mode === 'loci') {
            // Filter by loci - keep all specimens
            lociToInclude = Array.from(selectedLoci).sort((a, b) => a - b);
            specimensToInclude = null; // all
        } else {
            // Filter by specimens - keep all loci
            lociToInclude = sequenceData.map((_, idx) => idx);
            specimensToInclude = selectedSpecimens;
        }

        for (const locusIdx of lociToInclude) {
            const locus = sequenceData[locusIdx];
            let seqsToWrite;

            if (specimensToInclude) {
                seqsToWrite = locus.sequences.filter(seq => specimensToInclude.has(seq.seqname));
            } else {
                seqsToWrite = locus.sequences;
            }

            if (seqsToWrite.length === 0) continue;

            // Header: noseqs nosites
            outputLines.push(`${seqsToWrite.length} ${locus.nosites}`);

            // Sequences
            for (const seq of seqsToWrite) {
                outputLines.push(`${seq.seqname}  ${seq.seq}`);
            }

            // Blank line between loci
            outputLines.push('');
        }

        // Generate filename
        const baseName = seqFileName ? seqFileName.replace(/\.[^/.]+$/, '') : 'sequences';
        const suffix = mode === 'loci'
            ? `_${selectedLoci.size}loci`
            : `_${selectedSpecimens.size}seqs`;
        const outputFileName = `${baseName}${suffix}.txt`;

        return { text: outputLines.join('\n'), fileName: outputFileName };
    }

    handleSaveSubset() {
        const result = this.generateSubsetBpp();
        if (result) {
            const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
            FileSaver.saveAs(blob, result.fileName);
            this.setState({ dropdownOpen: false });
        }
    }

    getSelectionSummary() {
        const { mode, selectedSpecimens, selectedLoci } = this.state;
        if (mode === 'specimens') {
            const total = this.getSpecimenNames().length;
            const selected = selectedSpecimens.size;
            if (selected === 0) return 'All specimens';
            return `${selected} of ${total}`;
        } else {
            const total = this.getLociInfo().length;
            const selected = selectedLoci.size;
            if (selected === 0) return 'All loci';
            return `${selected} of ${total}`;
        }
    }

    hasSelection() {
        const { mode, selectedSpecimens, selectedLoci } = this.state;
        if (mode === 'specimens') {
            return selectedSpecimens.size > 0;
        } else {
            return selectedLoci.size > 0;
        }
    }

    render() {
        const { sequenceData } = this.props;
        const { mode, dropdownOpen, filterText, selectedSpecimens, selectedLoci } = this.state;

        if (!sequenceData || sequenceData.length === 0) {
            return null;
        }

        const specimens = this.getSpecimenNames();
        const loci = this.getLociInfo();

        const filteredSpecimens = specimens.filter(name =>
            name.toLowerCase().includes(filterText.toLowerCase())
        );
        const filteredLoci = loci.filter(l =>
            l.label.toLowerCase().includes(filterText.toLowerCase())
        );

        const allSpecimensSelected = selectedSpecimens.size === specimens.length && specimens.length > 0;
        const allLociSelected = selectedLoci.size === loci.length && loci.length > 0;

        return (
            <div className="subset-selector" ref={this.dropdownRef}>
                <span className="subset-label">Extract:</span>

                <div className="subset-dropdown-container">
                    <button
                        className="subset-dropdown-trigger"
                        onClick={this.toggleDropdown}
                    >
                        <span>{this.getSelectionSummary()}</span>
                        <span className="subset-arrow">{dropdownOpen ? '\u25B2' : '\u25BC'}</span>
                    </button>

                    {dropdownOpen && (
                        <div className="subset-dropdown-menu">
                            <div className="subset-mode-tabs">
                                <button
                                    className={`subset-mode-tab ${mode === 'specimens' ? 'active' : ''}`}
                                    onClick={() => this.handleModeChange('specimens')}
                                >
                                    Specimens
                                </button>
                                <button
                                    className={`subset-mode-tab ${mode === 'loci' ? 'active' : ''}`}
                                    onClick={() => this.handleModeChange('loci')}
                                >
                                    Loci
                                </button>
                            </div>

                            <div className="subset-select-all">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={mode === 'specimens' ? allSpecimensSelected : allLociSelected}
                                        onChange={this.handleSelectAll}
                                    />
                                    Select all
                                </label>
                            </div>

                            <div className="subset-filter">
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    value={filterText}
                                    onChange={this.handleFilterChange}
                                />
                            </div>

                            <div className="subset-checkbox-list">
                                {mode === 'specimens' ? (
                                    filteredSpecimens.map(name => (
                                        <label key={name} className="subset-checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecimens.has(name)}
                                                onChange={() => this.handleSpecimenToggle(name)}
                                            />
                                            <span className="subset-item-name">{name}</span>
                                        </label>
                                    ))
                                ) : (
                                    filteredLoci.map(locus => (
                                        <label key={locus.index} className="subset-checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedLoci.has(locus.index)}
                                                onChange={() => this.handleLocusToggle(locus.index)}
                                            />
                                            <span className="subset-item-name">{locus.label}</span>
                                            <span className="subset-item-info">{locus.sites} bp</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {this.hasSelection() && (
                    <span className="subset-selection-badge">
                        {mode === 'specimens' ? selectedSpecimens.size : selectedLoci.size} selected
                    </span>
                )}

                <button
                    className="subset-save-btn"
                    onClick={this.handleSaveSubset}
                    disabled={!this.hasSelection()}
                >
                    Save As...
                </button>
            </div>
        );
    }
}

export default SubsetSelector;
