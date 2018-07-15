import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import go from 'gojs'

const $ = go.GraphObject.make;

class Canvas extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        myDiagram: {}
    }

    componentDidMount = () => {
        this.state.myDiagram = this.props.diagram;
        
        this.state.myDiagram = $(go.Diagram, "myDiagramDiv",
            {
            "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
            });

        let myModel = $(go.Model);
        // in the model data, each node is represented by a JavaScript object:
        myModel.nodeDataArray = [
        { key: "Alpha" },
        { key: "Beta" },
        { key: "Gamma" }
        ];
        this.state.myDiagram.model = myModel;
        console.log(this.state.myDiagram)
    }


    render = () => { 
        return (
            <div id="myDiagramDiv" style={{height:'800px', border: '5px solid black'}}></div>
        );
    }
}

export default Canvas;