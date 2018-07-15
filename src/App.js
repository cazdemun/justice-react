import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import SideMenu from './SideMenu/SideMenu'
import Canvas from './Canvas/Canvas'

import 'bootstrap/dist/css/bootstrap.min.css'
import go from 'gojs'

const $ = go.GraphObject.make;

class App extends Component {
  
  constructor(props) {
    super(props);

  }
  state = {
    myDiagram: {}
  }

  addNodeHandler = () => {
    this.state.myDiagram.startTransaction("make new node");
    this.state.myDiagram.model.addNodeData({ key: "New" });
    this.state.myDiagram.commitTransaction("make new node");
  }

  saveFileHandler = () => {
    let text = JSON.stringify(this.state.myDiagram.model.nodeDataArray);
    console.log(text);

    let filename = "hello.json";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

  loadFileHandler = (event) => {

    var reader = new FileReader();
    reader.onload = event => {
      const fileString = event.target.result;
      console.log(fileString);
      console.log(typeof fileString);
      
      let loadedModel = $(go.Model);
      // in the model data, each node is represented by a JavaScript object:
      loadedModel.nodeDataArray = JSON.parse(fileString);

      this.state.myDiagram.model = loadedModel;

    };
    reader.readAsText(event.target.files[0]);
  }

  //onReaderLoad

  componentDidMount = () => {    
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
}


  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-8 col-lg-8 col-xl-8">
            <div id="myDiagramDiv" style={{height:'800px', border: '5px solid black'}}></div>
          </div>
          <div className="col-md-4 col-lg-4 col-xl-4">
            <SideMenu 
              addClicked={this.addNodeHandler}
              saveClicked={this.saveFileHandler}
              submitted={this.loadFileHandler}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
