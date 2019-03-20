import React, { Component } from "react";
import "./Mapfile.css";

class DisplayFilters extends Component {
    constructor(props) {
        super(props);
        this.createFilters = this.createFilters.bind(this);
    }

    createFilters(item)
    {
        return <dl key = {item.key} >{item.text}</dl>
    }
    

    render() {
        let filterList = this.props.filters;
        let filterItems = filterList.map(this.createFilters);
        return (
            <div>
              <div className="map-box" >
                <ul>
                  {filterItems}
                </ul>
              </div>
            </div>
        );
    }
}





export default DisplayFilters;
