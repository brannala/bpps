import React, { Component } from "react";
import { uniqueSeqNames, seqToSpecName, createMapFileText } from "./MapFunctions";
import { Columns, Column } from 'react-flex-columns';
import "./Mapfile.css";
import DisplayMatchedSeqs from "./DisplayMatchedSeqs";
import DisplayUnmatchedSeqs from "./DisplayUnmatchedSeqs";
import DisplayFilters from "./DisplayFilters";
// import DownLoadFile from "./DownLoadFile";
var FileSaver = require('file-saver');

function MapIsDone(props)
{
 //   const isDone = props.mapDone;
    if(props.mapDone)
    {
        let mapFileName = props.seqFileName.substr(0,props.seqFileName.indexOf('.'));
        if(mapFileName==="")
            mapFileName = props.seqFileName + "map.txt";
        else
            mapFileName = mapFileName + "map.txt";
	let text = createMapFileText(props.seqMatches);
	var blob = new Blob([text],{type: "text/plain;charset=utf-8"});
	let downloadClick = (e) => { FileSaver.saveAs(blob,mapFileName); }
	return (
	    <div className="downloadFile">
	      <label>Map file is ready for download: </label><button className="downButton" onClick={downloadClick}>Download</button>
	    </div>
	);
    }
    else
        return (
	    <div className="downloadFile">
	      <p>Sequence names must be completely filtered before map file can be downloaded.</p>	      
	    </div>
	);
}

class MapFile extends Component {
    constructor(props) {
        super(props);
        this.state = { seqMatches: {matchedSeqs: [],  unmatchedSeqs: uniqueSeqNames(this.props.sequenceData)},
                       uniqSeqs: uniqueSeqNames(this.props.sequenceData), regExp_SpName: [], filters: [], mapDone: false };
        this.addFilter = this.addFilter.bind(this);

    }
    
    // adds a new filter (filter = "species + regex" for display, regExp_SpName for filtering) and updates seqMatches object with new filter added
    addFilter(e) {
        
        const regExp_SpN = this.state.regExp_SpName;
        let rExp, seqMc = this.state.seqMatches, filterArray = this.state.filters;
        const uniq = [];
        for(let i in this.state.uniqSeqs)
            uniq.push(this.state.uniqSeqs[i]);
        
        if((this._spNameInput.value !== "")&&(this._regExpInput.value !== ""))
        {
            filterArray.unshift({ text: this._spNameInput.value + " + " + this._regExpInput.value, key: Date.now()});
            try
            {
                rExp = new RegExp(this._regExpInput.value);
                regExp_SpN.push({ reg_exp: rExp, spName: this._spNameInput.value });
                seqMc = seqToSpecName(uniq,regExp_SpN);
                this.setState({ filters: filterArray });
                this.setState({ regExp_SpNames: regExp_SpN });
                this.setState({ seqMatches: seqMc });
                    e.preventDefault();
            }
            catch(e) { alert(`warning! invalid regular expression syntax: ${this._regExpInput.value}`); }                               

            if((seqMc.matchedSeqs.length>0)&&(seqMc.unmatchedSeqs.length===0))
                this.setState({ mapDone: true}); 
        }
        this._spNameInput.value = "";
        this._regExpInput.value = "";
    }

    
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
              <div>
                <MapIsDone mapDone={this.state.mapDone} seqMatches={this.state.seqMatches} seqFileName={this.props.seqFileName}/>
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
