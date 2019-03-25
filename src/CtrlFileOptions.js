import React, { Component } from "react";
import "./CtrlFile.css";

class CtrlFileOptions extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const Checkbox = props => (
            <input type="checkbox" {...props} />
        )
        if(this.props.mapData.size > 0)
        return(
            <div className="options-box">
              <p>Control File Options</p>
              <ul>
              <form>
                  <li>
                    <label>
                      <Checkbox
                        checked={this.props.ctrlFileOpts.speciesDelim}
                        onChange={this.props.handleSpecDelimCheckbox}
                      />
                      <span>Species Delimitation</span>
                    </label>
              </li>
                <li>
                  <label>
                    <Checkbox
                      checked={this.props.ctrlFileOpts.speciesTreeInf}
                      onChange={this.props.handleSpecTreeInfCheckbox}
                    />
                    <span>Species Tree Inferred</span>
                  </label>

                </li>
                <li>
                  <label>
                    <Checkbox
                      checked={this.props.ctrlFileOpts.diploid}
                      onChange={this.props.handleDiploidCheckbox}
                    />
                    <span>Diploid Sequence Data</span>
                  </label>
                </li>
                <li>
                  <label>
                    <span>Burnin</span>
                    <input onChange={this.props.handleBurninSet} name="burnin" type="number" min="1" value={this.props.ctrlFileOpts.burnin} className="burninField" />
                  </label>
                </li>
                <li>
                  <label>
                    <span>Sampling Frequency</span>
                    <input onChange={this.props.handleSampleFreqSet} name="sfreq" type="number" min="1" value={this.props.ctrlFileOpts.sampleFreq} className="sFreqField" />
                  </label>
                  </li>
                  <li>
                  <label>
                    <span>MCMC Samples</span>
                    <input onChange={this.props.handleMcmcSamples} name="mcmc" type="number" min="1" value={this.props.ctrlFileOpts.mcmcSamples} className="mcmcField" />
                  </label>
            </li>
              </form>
                </ul>



            </div>
        );
        else
            return( null )
    }

    
}

export default CtrlFileOptions;
