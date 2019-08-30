import React from "react";
import logo from "./logo.svg";
import TreeView, { ScaledTree, TreeEditor } from "./tree";
import TreeBasic from "./tree/Tree";
import "./App.css";
import data from "./tree/data";

const App: React.FC = () => {
    // return <TreeBasic data={data} width={500} height={500}/>
    return <TreeEditor data={{isExpanded:true, name:"rootBoi", id:"root", children:[{name:"yeah baby :^^^^^^^)", id:"u know", isExpanded:true}]}} width={600} height={500}/>
	return <TreeView />;
};
export default App;
