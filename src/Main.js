import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter
} from "react-router-dom";
import Sequences from "./Sequences";
import MapFile from "./MapFile";
import FormatSeqs, {formatSeqs, getCounts} from "./FormatSeqs";
import MapFunctions, {uniqueSeqNames} from "./MapFunctions"; 
import SeqRead from "./SeqRead"


class Main extends Component {
    constructor() {
        super();
        this.state = { seqFiletext: '', sequenceData: [], locusArray: [], locusCounts: [], uniqSeqNames: [] };
        this.readFile = this.readFile.bind(this);
    }
    // callback function handles file read. Passed to Sequences then to GetSeqFile
    readFile(currentText) {
        let parseResult;
        this.setState(()=>({seqFiletext: currentText }));
        parseResult = SeqRead(currentText);
        if(parseResult.error === null)    // input file parsed with no errors
        {
            this.setState(()=>({sequenceData: parseResult.sequenceData }));
            this.setState(()=>({locusArray: formatSeqs(this.state.sequenceData) }));
            this.setState(()=>({locusCounts: getCounts(this.state.sequenceData) }));
            this.setState(()=>({uniqSeqNames: uniqueSeqNames(this.state.sequenceData) })); 
        }
        else // input file parsing errors. Empty data and display error message.
        {
            alert(parseResult.error);
            this.setState(()=>({sequenceData: [] }));
            this.setState(()=>({locusArray: [" "] }));
            this.setState(()=>({locusCounts: [] }));
            this.setState(()=>({uniqSeqNames: [] }));
        }
    }
    
    render() {
        return (
            <HashRouter>
              <div>
                <h1>Minimalist bpp</h1>
                <ul className="header">
                  <li><NavLink to="/">Upload Sequences</NavLink></li>
                  <li><NavLink to="/MapFile">Create Map File</NavLink></li>
                </ul>
                <div className="content">
                  <Route exact path="/" render={(props) => <Sequences {...props} readFile={this.readFile} locusArray={this.state.locusArray} locusCounts={this.state.locusCounts}  /> } />
                  <Route path="/Mapfile" render={(props) => <MapFile {...props} sequenceData={this.state.sequenceData} uniqSeqNames={this.state.uniqSeqNames}  /> } />
                </div>
              </div>
            </HashRouter>              

        );
    }
}

export default Main;
