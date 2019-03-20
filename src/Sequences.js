import React, { Component } from "react";
import './DisplaySeqs.css';
//import FileReader from "./FileReader";
import DisplaySeqs from "./DisplaySeqs";
import GetSeqFile from "./NewFileReader";
class Sequences extends Component {
    constructor(props) {
        super(props);
        this.state = { posInLocusArray: 0 };

        this.initPosInLocusArray = this.initPosInLocusArray.bind(this);
       this.handleScanClickUp = this.handleScanClickUp.bind(this);                                                                  
        this.handleScanClickDown = this.handleScanClickDown.bind(this);                                                              
 
    }

    initPosInLocusArray() { this.setState(()=>({ posInLocusArray: 0 })); };  // callback sets posInLocusArray to 0 when new file is read

                                                                                                                                   
    handleScanClickUp(e)                                                                                                             
    {                                                                                                                                
        if(this.state.posInLocusArray < this.props.locusArray.length-1)                                                                      
        {                                                                                                                            
            this.setState(()=>({ posInLocusArray: this.state.posInLocusArray + 1 }));                                                                
        }                                                                                                                            
    }                                                                                                                                
                                                                                                                                     
    handleScanClickDown(e)                                                                                                           
    {                                                                                                                                
        if(this.state.posInLocusArray > 0)                                                                                                
        {                                                                                                                            
                                                                                                                                     
            this.setState({ posInLocusArray: this.state.posInLocusArray-1 });                                                  
        }                                                                                                                            
    }                                                                                                                                


    render() {
        
        return (
            <div>
              <div className="seqview">
              <h2>Step 1:</h2>
              <p>Upload a file containing DNA sequences in bpp format.</p>
              <GetSeqFile readFile={this.props.readFile} initPosInLocusArray={this.initPosInLocusArray}/>
              <DisplaySeqs locusText={this.props.locusArray[this.state.posInLocusArray]} />
              <div><button onClick={this.handleScanClickDown}> - </button>                                                           
                <button onClick={this.handleScanClickUp}> + </button>                                                         
                <span className="counts">Locus: {this.props.locusArray.length>0 ? this.state.posInLocusArray + 1 : " 0 "} / {this.props.locusArray.length}</span>
                <span className="counts">NoSeqs: {(this.props.locusCounts!==undefined)&&(this.props.locusCounts.length!==0) ?
                this.props.locusCounts[this.state.posInLocusArray].noseqs : " 0 "}</span>
                <span className="counts"> NoSites: {(this.props.locusCounts!==undefined)&&(this.props.locusCounts.length!==0) ?
                                                                 this.props.locusCounts[this.state.posInLocusArray].nosites : " 0 "}</span>
                </div>
              </div>
              <div className="quick-start">
              <p>Quick start: Choose a file with aligned sequences at one or more loci in bpp format (non-interleaved).
                The bpp format is a text file with a series of one or more loci arranged sequentially. a description of
                the bpp sequence data file format (and example) are found here.  Once the data are successfully
                uploaded continue to step 2 (create map file).</p>
                </div>
             
            </div>
        );
    }
}

export default Sequences;

