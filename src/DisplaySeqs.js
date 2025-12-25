import React, { Component } from 'react';
import './DisplaySeqs.css';

class DisplaySeqs extends Component {
    // Color a single nucleotide character
    colorNucleotide(char, index) {
        const upperChar = char.toUpperCase();
        let className = '';

        switch (upperChar) {
            case 'A':
                className = 'nuc-a';
                break;
            case 'T':
            case 'U':
                className = 'nuc-t';
                break;
            case 'G':
                className = 'nuc-g';
                break;
            case 'C':
                className = 'nuc-c';
                break;
            case '-':
                className = 'nuc-gap';
                break;
            case 'N':
                className = 'nuc-n';
                break;
            default:
                className = '';
        }

        return (
            <span key={index} className={className}>
                {char}
            </span>
        );
    }

    // Render sequence text with colored nucleotides (only color sequence, not names)
    renderColoredSequence(text) {
        if (!text) return null;

        const lines = text.split('\n');

        // Parse all lines first to find the longest name
        const parsedLines = lines.map(line => {
            const match = line.match(/^(\S+)(\s+)(.*)$/);
            if (match) {
                return { name: match[1], sequence: match[3] };
            }
            return { name: line, sequence: '' };
        });

        const maxNameLength = Math.max(...parsedLines.map(l => l.name.length));
        const nameWidth = `${maxNameLength}ch`;

        return parsedLines.map((parsed, lineIndex) => (
            <div key={lineIndex} className="seq-line">
                <span className="seq-name" style={{ minWidth: nameWidth }}>
                    {parsed.name}
                </span>
                <span className="seq-bases">
                    {parsed.sequence.split('').map((char, charIndex) =>
                        this.colorNucleotide(char, charIndex)
                    )}
                </span>
            </div>
        ));
    }

    render() {
        return (
            <div className="seqview2">
                <div className="seq-box-colored">
                    <div className="seq-content">
                        {this.renderColoredSequence(this.props.locusText)}
                    </div>
                </div>
            </div>
        );
    }
}

export default DisplaySeqs;
