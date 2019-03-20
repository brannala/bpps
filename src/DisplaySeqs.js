import React, { Component } from 'react';

import './DisplaySeqs.css';


class  DisplaySeqs extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        // console.log('locusText: ' + this.props.locusText);
        return (
            <div className="seqview2">
              <textarea readOnly wrap='off' className='seq-box' value={this.props.locusText} />
            </div>
        );
    }
}
    
export default DisplaySeqs;
