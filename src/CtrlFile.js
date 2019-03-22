import React, { Component } from "react";
import { Columns, Column } from 'react-flex-columns';
import "./CtrlFile.css";
import CtrlFunc, { ParseMapText, pairwiseDistance } from "./CtrlFunc";
import GetFile from "./GetFile";
var FileSaver = require('file-saver');


function MapFileUpload(props) {
        if(props.sequenceData.length > 0)
        {
            return (
                <div>
                <p>Sequence Data Ready!</p>
                  <GetFile readFile={props.readFile} fileType={"map"}/>
                </div>
            );
        }
        else
        {
            return (
                <p>Go to step 1 and upload sequence data to begin.</p>
            );
        }
    }
    
class CtrlFile extends Component {
    constructor(props) {
        super(props);
        this.state = { mapData: [] };
        this.handleMapFileRead = this.handleMapFileRead.bind(this);
    }

    handleMapFileRead(fileContents)
    {
        console.log(ParseMapText(fileContents));
  //     this.SetState({ mapData: parseMapText(fileContents) })
        
    }

    render() {
        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 3:</h2>
                <p>Create a control file in bpp format. We will use the sequence data you uploaded to choose sensible defaults</p>
                <Columns gutters stackMaxWidth={700}>
                  <Column size={20}>
	            <MapFileUpload sequenceData={this.props.sequenceData} readFile={this.handleMapFileRead} />
                  </Column>
                  <Column siz={20}>
		    <p>placeholder</p>
                  </Column>
                </Columns>
              </div>
              <div>

              </div>
              <div className="quick-start"><p>Quick start: If step 1 is complete a link will appear above to upload a map file. Upload the mapfile created in step 2 (or another mapfile conforming with the sequence data uploaded in step 1.</p></div>
            </div>
        );
    }
}

export default CtrlFile;
