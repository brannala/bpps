import React, { Component } from "react";
import "./Mapfile.css";

class DisplayUnmatchedSeqs extends Component {
    constructor(props) {
        super(props);
    }
// creates a formatted string of unmatched sequences from vector unMatchedVec for display
    getUnmatchedAsString(unMatchedVec)
    {
        let unmatched = "";
        if(unMatchedVec.length>0)
        {
            for(let i in unMatchedVec)
                unmatched += (unMatchedVec[i] + "\n");
        }
        return unmatched.trim();
    }
    
    render() {
        return (
            <div>
              <div className="title">
                <p>Sequences names</p>
              </div>
              <div className="col2">
                <textarea className="text-unmapped" value={this.getUnmatchedAsString(this.props.seqMatches.unmatchedSeqs)}></textarea>
              </div>
            </div>
        );
    }
}

export default DisplayUnmatchedSeqs;
