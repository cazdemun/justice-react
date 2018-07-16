import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import SideMenu from './SideMenu/SideMenu'

import go from 'gojs'

const $ = go.GraphObject.make;

class App extends Component {
  
  state = {
    myDiagram: {}
  }

  diagram={}
  addNodeHandler = () => {
    this.state.myDiagram.startTransaction("make new node");
    this.state.myDiagram.model.addNodeData({ key: "New" });
    this.state.myDiagram.commitTransaction("make new node");
  }

  saveFileHandler = () => {
    let text = JSON.stringify(this.state.myDiagram.model.nodeDataArray);
    console.log(text);
    let filename;
    let person = prompt("Please enter your name", "NewDiagram.json");

    if (person != null) {
      filename = person;
    } else {
      filename = "hello.json";
    }

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
      
      let loadedModel = $(go.TreeModel);
      loadedModel.nodeDataArray = JSON.parse(fileString);
      // THIS STATE IS MODIFIED IDK HOW TO FIX IT
      this.diagram = this.state.myDiagram;
      this.diagram.model = loadedModel;
      this.setState({
        myDiagram: this.diagram
      })
    };
    reader.readAsText(event.target.files[0]);
  }

  componentDidMount = () => {    
    this.diagram = $(go.Diagram, "myDiagramDiv",
        {
        padding: 20,
        // when the user drags a node, also move/copy/delete the whole subtree starting with that node
        "commandHandler.copiesTree": true,
        "commandHandler.deletesTree": true,
        "draggingTool.dragsTree": true,
        initialContentAlignment: go.Spot.Center,  // center the whole graph
        "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
    });

    // a node consists of some text with a line shape underneath
    this.diagram.nodeTemplate =
    $(go.Node, "Vertical",
      { selectionObjectName: "TEXT" },
      $(go.TextBlock,
        {
          name: "TEXT",
          minSize: new go.Size(30, 15),
          editable: true
        },
        // remember not only the text string but the scale and the font in the node data
        new go.Binding("text", "text").makeTwoWay(),
        new go.Binding("scale", "scale").makeTwoWay(),
        new go.Binding("font", "font").makeTwoWay()),
      $(go.Shape, "LineH",
        {
          stretch: go.GraphObject.Horizontal,
          strokeWidth: 3, height: 3,
          // this line shape is the port -- what links connect with
          portId: "", fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides
        },
        new go.Binding("stroke", "brush"),
        // make sure links come in from the proper direction and go out appropriately
        new go.Binding("fromSpot", "dir", (d) => this.spotConverter(d, true) ),
        new go.Binding("toSpot", "dir", (d) => this.spotConverter(d, false) )),
      // remember the locations of each node in the node data
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // make sure text "grows" in the desired direction
      new go.Binding("locationSpot", "dir", (d) => this.spotConverter(d, false) )
    );

    // selected nodes show a button for adding children
    this.diagram.nodeTemplate.selectionAdornmentTemplate =
    $(go.Adornment, "Spot",
      $(go.Panel, "Auto",
        // this Adornment has a rectangular blue Shape around the selected node
        $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
        $(go.Placeholder, { margin: new go.Margin(4, 4, 0, 4) })
      ),
      // and this Adornment has a Button to the right of the selected node
      $("Button",
        {
          alignment: go.Spot.Right,
          alignmentFocus: go.Spot.Left,
          click: this.addNodeAndLink  // define click behavior for this Button in the Adornment
        },
        $(go.TextBlock, "+",  // the Button content
          { font: "bold 8pt sans-serif" })
      )
    );

    // the context menu allows users to change the font size and weight,
    // and to perform a limited tree layout starting at that node
    this.diagram.nodeTemplate.contextMenu =
      $(go.Adornment, "Vertical",
        $("ContextMenuButton",
          $(go.TextBlock, "Layout"),
          {
            click: (e, obj) => {
                var adorn = obj.part;
                adorn.diagram.startTransaction("Subtree Layout");
                this.layoutTree(adorn.adornedPart);
                adorn.diagram.commitTransaction("Subtree Layout");
              }
          }
        )
      );


    // a link is just a Bezier-curved line of the same color as the node to which it is connected
    this.diagram.linkTemplate =
    $(go.Link,
      {
        curve: go.Link.Bezier,
        fromShortLength: -2,
        toShortLength: -2,
        selectable: false
      },
      $(go.Shape,
        { strokeWidth: 3 },
        new go.Binding("stroke", "toNode", (n) => (n.data.brush) ? n.data.brush : "black" ).ofObject())
    );

    this.diagram.addDiagramListener("SelectionMoved", (e) => {
      var rootX = this.diagram.findNodeForKey(0).location.x;
      this.diagram.selection.each((node) => {
          if (node.data.parent !== 0) return; // Only consider nodes connected to the root
          var nodeX = node.location.x;
          if (rootX < nodeX && node.data.dir !== "right") {
            this.updateNodeDirection(node, "right", this.diagram);
          } else if (rootX > nodeX && node.data.dir !== "left") {
            this.updateNodeDirection(node, "left", this.diagram);
          }
          this.layoutTree(node);
        });
    });

    let myModel = $(go.TreeModel);
    // in the model data, each node is represented by a JavaScript object:
    myModel.nodeDataArray = [
      {"key":0, "text":"Mind Map", "loc":"0 0"},
      {"key":1, "parent":0, "text":"Getting more time", "brush":"skyblue", "dir":"right", "loc":"77 -22"},
      {"key":11, "parent":1, "text":"Wake up early", "brush":"skyblue", "dir":"right", "loc":"200 -48"},
      {"key":12, "parent":1, "text":"Delegate", "brush":"skyblue", "dir":"right", "loc":"200 -22"},
      {"key":13, "parent":1, "text":"Simplify", "brush":"skyblue", "dir":"right", "loc":"200 4"},
      {"key":2, "parent":0, "text":"More effective use", "brush":"darkseagreen", "dir":"right", "loc":"77 43"},
      {"key":21, "parent":2, "text":"Planning", "brush":"darkseagreen", "dir":"right", "loc":"203 30"},
      {"key":211, "parent":21, "text":"Priorities", "brush":"darkseagreen", "dir":"right", "loc":"274 17"},
      {"key":212, "parent":21, "text":"Ways to focus", "brush":"darkseagreen", "dir":"right", "loc":"274 43"},
      {"key":22, "parent":2, "text":"Goals", "brush":"darkseagreen", "dir":"right", "loc":"203 56"},
      {"key":3, "parent":0, "text":"Time wasting", "brush":"palevioletred", "dir":"left", "loc":"-20 -31.75"},
      {"key":31, "parent":3, "text":"Too many meetings", "brush":"palevioletred", "dir":"left", "loc":"-117 -64.25"},
      {"key":32, "parent":3, "text":"Too much time spent on details", "brush":"palevioletred", "dir":"left", "loc":"-117 -25.25"},
      {"key":33, "parent":3, "text":"Message fatigue", "brush":"palevioletred", "dir":"left", "loc":"-117 0.75"},
      {"key":331, "parent":31, "text":"Check messages less", "brush":"palevioletred", "dir":"left", "loc":"-251 -77.25"},
      {"key":332, "parent":31, "text":"Message filters", "brush":"palevioletred", "dir":"left", "loc":"-251 -51.25"},
      {"key":4, "parent":0, "text":"Key issues", "brush":"coral", "dir":"left", "loc":"-20 52.75"},
      {"key":41, "parent":4, "text":"Methods", "brush":"coral", "dir":"left", "loc":"-103 26.75"},
      {"key":42, "parent":4, "text":"Deadlines", "brush":"coral", "dir":"left", "loc":"-103 52.75"},
      {"key":43, "parent":4, "text":"Checkpoints", "brush":"coral", "dir":"left", "loc":"-103 78.75"}
       ]
    
    this.diagram.model = myModel;

    this.setState({
      myDiagram: this.diagram
    })
}

updateNodeDirection(node, dir, diagram) {
  diagram.model.setDataProperty(node.data, "dir", dir);
  // recursively update the direction of the child nodes
  var chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
  while(chl.next()) {
    this.updateNodeDirection(chl.value, dir, diagram);
  }
}

spotConverter(dir, from) {
  if (dir === "left") {
    return (from ? go.Spot.Left : go.Spot.Right);
  } else {
    return (from ? go.Spot.Right : go.Spot.Left);
  }
}

addNodeAndLink = (e, obj) => {
  var adorn = obj.part;
  let diagramA = adorn.diagram;
  diagramA.startTransaction("Add Node");
  var oldnode = adorn.adornedPart;
  var olddata = oldnode.data;
  // copy the brush and direction to the new node data
  var newdata = { text: "idea", brush: olddata.brush, dir: olddata.dir, parent: olddata.key };
  diagramA.model.addNodeData(newdata);
  this.layoutTree(oldnode);
  diagramA.commitTransaction("Add Node");

  // if the new node is off-screen, scroll the diagram to show the new node
  var newnode = diagramA.findNodeForData(newdata);
  if (newnode !== null) diagramA.scrollToRect(newnode.actualBounds);
}

layoutTree = (node) => {
  if (node.data.key === 0) {  // adding to the root?
    this.layoutAll();  // lay out everything
  } else {  // otherwise lay out only the subtree starting at this parent node
    var parts = node.findTreeParts();
    this.layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}

layoutAngle(parts, angle) {
  var layout = go.GraphObject.make(go.TreeLayout,
      { angle: angle,
        arrangement: go.TreeLayout.ArrangementFixedRoots,
        nodeSpacing: 5,
        layerSpacing: 20,
        setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
        setsChildPortSpot: false });
  layout.doLayout(parts);
}

layoutAll = () => {
  var root = this.diagram.findNodeForKey(0);
  if (root === null) return;

  this.diagram.startTransaction("Layout");

  // split the nodes and links into two collections=
  var rightward = new go.Set(go.Part);
  var leftward = new go.Set(go.Part);

  root.findLinksConnected().each((link) => {
      var child = link.toNode;
      if (child.data.dir === "left") {
        leftward.add(root);  // the root node is in both collections
        leftward.add(link);
        leftward.addAll(child.findTreeParts());
      } else {
        rightward.add(root);  // the root node is in both collections
        rightward.add(link);
        rightward.addAll(child.findTreeParts());
      }
    });

  // do one layout and then the other without moving the shared root node
  this.layoutAngle(rightward, 0);
  this.layoutAngle(leftward, 180);

  this.diagram.commitTransaction("Layout");
}

  myDiagramStyle = {
    height:'800px', 
    border: '5px solid black'
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-10 col-lg-10 col-xl-10">
            <div id="myDiagramDiv" style={this.myDiagramStyle}></div>
          </div>
          <div className="col-md-2 col-lg-2 col-xl-2">
            <SideMenu 
              saveClicked={this.saveFileHandler}
              submitted={this.loadFileHandler}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
