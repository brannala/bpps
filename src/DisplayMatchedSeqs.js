import React, { Component } from "react";
import "./Mapfile.css";

class DisplayMatchedSeqs extends Component {
    constructor(props) {
        super(props);
        this.getMatchedAsString = this.getMatchedAsString.bind(this); 
    }


    getMatchedAsString()
    {
        let matched = "";
        console.log(this.props.seqMatches.matchedSeqs);

        
        if(this.props.seqMatches.matchedSeqs.length>0)
        {
            for(let i=0; i < this.props.seqMatches.matchedSeqs.length; i++)
                for(let j=0; j < this.props.seqMatches.matchedSeqs[i].seqNames.length; j++)
            {
                matched += (this.props.seqMatches.matchedSeqs[i].seqNames[j] + " = " + this.props.seqMatches.matchedSeqs[i].spName + "\n");
            } 
        } 
        return matched.trim();
    }



    render() {
        return (
            <div>
              <div className="title">
                <p>Sequence name =  species name </p>                     
              </div>
              <div className="col3">
                <textarea className="text-mapped" value={this.getMatchedAsString()}></textarea>
              </div>
            </div>
        );
    }
}





export default DisplayMatchedSeqs;
