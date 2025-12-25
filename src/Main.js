import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter
} from "react-router-dom";
import Sequences from "./Sequences";
import MapFile from "./MapFile";
import {formatSeqs, getCounts} from "./FormatSeqs";
import SeqRead from "./SeqRead";
import CtrlFile from "./CtrlFile";

class Main extends Component {
    constructor() {
        super();
        this.state = { seqFiletext: '', sequenceData: [], locusArray: [], locusCounts: [], seqFileName: '', parseError: null };
        this.readFile = this.readFile.bind(this);
    }
    // callback function handles file read. Passed to Sequences then to GetSeqFile
    readFile(currentText, fileName) {
        const parseResult = SeqRead(currentText);
        if (parseResult.error === null) {
            // Batch all state updates together and use parseResult.sequenceData directly
            // (not this.state.sequenceData which may be stale due to async setState)
            this.setState({
                seqFiletext: currentText,
                sequenceData: parseResult.sequenceData,
                locusArray: formatSeqs(parseResult.sequenceData),
                locusCounts: getCounts(parseResult.sequenceData),
                seqFileName: fileName,
                parseError: null
            });
        } else {
            this.setState({
                seqFiletext: currentText,
                sequenceData: [],
                locusArray: [],
                locusCounts: [],
                parseError: parseResult.error
            });
        }
    }
    
    render() {
        return (
            <HashRouter>
              <div>
                <h1>Minimalist bpp</h1>
                <ul className="header">
                  <li><NavLink exact to="/">Upload Sequences</NavLink></li>
                  <li><NavLink to="/MapFile">Create Map File</NavLink></li>
                  <li><NavLink to="/CtrlFile">Create Control File</NavLink></li>
                </ul>
                <div className="content">
                  <Route exact path="/" render={(props) => <Sequences {...props} readFile={this.readFile} locusArray={this.state.locusArray} locusCounts={this.state.locusCounts} parseError={this.state.parseError} /> } />
                  <Route path="/MapFile" render={(props) => <MapFile {...props} sequenceData={this.state.sequenceData} seqFileName={this.state.seqFileName}/> } />
                  <Route path="/CtrlFile" render={(props) => <CtrlFile {...props} sequenceData={this.state.sequenceData} seqFileName={this.state.seqFileName}/> } />
                </div>
              </div>
            </HashRouter>              

        );
    }
}

export default Main;
