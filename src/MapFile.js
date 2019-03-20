import React, { Component } from "react";
import MapFunctions, { uniqueSeqNames, seqToSpecName } from "./MapFunctions";
import { Columns, Column } from 'react-flex-columns';
import "./Mapfile.css";
import DisplayMatchedSeqs from "./DisplayMatchedSeqs";
import DisplayUnmatchedSeqs from "./DisplayUnmatchedSeqs";
import DisplayFilters from "./DisplayFilters";

class MapFile extends Component {
    constructor(props) {
        super(props);
        this.state = { seqMatches: {unmatchedSeqs: [], matchedSeqs: []}, regExp_SpName: [], filters: [{text: "Homo_sapiens + /.*(HSap).*/", key: 666}] };

        this.addFilter = this.addFilter.bind(this);
    }

    componentDidMount(){
        this.setState(()=>({seqMatches: {matchedSeqs: [],  unmatchedSeqs: this.props.uniqSeqNames}}));
        // debugging code
//        const temp = [];
  //      temp.push({seqNames: ["Ame^0","Ame^1","Ame^2"],spName: "Ursus_Americanus", reg_exp: "*.*"});
    //    temp.push({seqNames: ["Ame^0","Ame^1","Ame^2"],spName: "Ursus_Americanus", reg_exp: "*.*"});
      //  this.setState(()=>({ seqMatches: {matchedSeqs: [{seqNames: ["Ame^0","Ame^1","Ame^2"],spName: "Ursus_Americanus", reg_exp: "*.*"}], unmatchedSeqs: this.props.uniqSeqNames }}));
        
    }

    addFilter(e) {
        let filterArray = this.state.filters;
        const regExp_SpN = this.state.regExp_SpName;
        let rExp, seqMc = { matchedSeqs: [], unmatchedSeqs: this.state.seqMatches.unmatchedSeqs };


        if((this._spNameInput.value !== "")&&(this._regExpInput.value !== "")) {
            filterArray.unshift({ text: this._spNameInput.value + " + " + this._regExpInput.value, key: Date.now()});
            //need to add code to check RegExp validity and add  / /
            rExp = new RegExp(this._regExpInput.value);
            regExp_SpN.push({ reg_exp: rExp, spName: this._spNameInput.value });
            seqMc.matchedSeqs = seqToSpecName(this.state.seqMatches.unmatchedSeqs,regExp_SpN);
            this.setState({ filters: filterArray });
            this.setState({ regExp_SpNames: regExp_SpN });
            this.setState({ seqMatches: seqMc });
            e.preventDefault();
        }
        this._spNameInput.value = "";
        this._regExpInput.value = "";
            
        }

//            console.log("entered a filter..." + this._spNameInput);
    
    render() {


        return (
            <div>
              <div className="mapfile-box">
              <h2>Step 2:</h2>
                <p>Create a map file in bpp format. Use regular expressions to associate sequence names with species names.</p>
                <Columns gutters stackMaxWidth={700}>
                  <Column size={10}>
                    <DisplayUnmatchedSeqs seqMatches={this.state.seqMatches}/>
                  </Column>
                  <Column size={21}>
                    <div className="title">
                      <p>Enter species name + regular expression</p>
                    </div>
                    <div className="col1">
                      <form onSubmit={this.addFilter}>
                        <input placeholder="species name" ref = {(a) => this._spNameInput = a}/>  +  <input placeholder="regular expression" ref = {(a) => this._regExpInput = a}/>
                        <button type="submit" className="smallButton">add</button>
                      </form>
                    </div>
                    <DisplayFilters filters={this.state.filters}/>
                  </Column>
                  <Column siz={20}>
                    <DisplayMatchedSeqs seqMatches={this.state.seqMatches}/>
                  </Column>
                </Columns>
  
            </div>
              <div className="quick-start"><p>Quick start: Enter species name in left box (e.g., Homo_sapiens)
                                             and a regular expression (RegExp) in right box to filter sequences. For example,
                                             /.*(Hsap).*/ finds sequence labels containing the substring "Hsap" (e.g., ^Hsap12 or MyHsapiens)
                                             but ignores a label such as H.sap. An online RegExp tester is found <a href="https://regexr.com">here</a>.</p></div>
            </div>

        );
    }
}

export default MapFile;

