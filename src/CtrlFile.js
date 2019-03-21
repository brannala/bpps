import React, { Component } from "react";
import { Columns, Column } from 'react-flex-columns';
import "./Mapfile.css";
var FileSaver = require('file-saver');

class CtrlFile extends Component {
    constructor(props) {
        super(props);

    }
    
    
    render() {
        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 3:</h2>
                <p>Create a control file in bpp format. We will use the sequence data you uploaded to choose sensible defaults</p>
                <Columns gutters stackMaxWidth={700}>
                  <Column size={10}>
		    <p>placeholder</p>
                  </Column>
                  <Column size={21}>
                    <div className="title">
                      <p>placeholder</p>
                    </div>
                    <div className="col1">
		     <p> placeholder </p>
                    </div>
                  </Column>
                  <Column siz={20}>
		    <p>placeholder</p>
                  </Column>
                </Columns>
              </div>
              <div>

              </div>
              <div className="quick-start"><p>Quick start: .</p></div>
            </div>
        );
    }
}

export default CtrlFile;
