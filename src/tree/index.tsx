import { TreeProps, TreeNodeData } from "./types";
import React, { FC, useState } from "react";
import Tree from "./Tree";
import data from "./data";
export { default as ScaledTree } from "./ScaledTree";

const DefaultView: FC = props => {
	return <Tree data={data} width={600} height={500} />;
};

class CustomizedView extends React.Component {
    constructor (props:{[key:string]:any}) {
        super(props)
        this.state={
            data:{ name: "root" },
            selected:null
        }
    }
    
    state:{
        data:TreeNodeData
        selected:TreeNodeData|null
    };

    render() {
        const {
            props,
        } = this;

        console.log("data", this.state.data)
        return (
            <Tree
                data={this.state.data}
                width={600}
                height={500}
                onNodeClick={(e, node, operations) =>{
                    if(this.state.selected){
                        this.state.selected.selected=false;
                    }
                    node.data.selected=true;
                    console.log("selected", node)
                    this.setState({selected:node.data});
                }}
                nodeChildren={(node, ops) => {
                    const width = node.data.renderWidth || 0;
                    const height = node.data.renderHeight || 0;
                    return (
                        <>
                            {node.data.selected && (
                                <>
                                    <svg
                                        width="25"
                                        height="25"
                                        x={
                                            node.depth > 0
                                                ? -(width / 2) - 12.5
                                                : -25 / 2
                                        }
                                        onClick={ev => {
                                            ev.preventDefault();
                                            const selected = this.state.selected;
                                            selected!.children= selected!.children ||[]
                                            if(ops.addNode){
                                                selected!.children.push(ops.addNode(node).data)
                                            }
                                        }}
                                        y={node.depth > 0 ? 0 : width / 2 - 25 / 2}
                                    >
                                        <circle
                                            r="12.5"
                                            fill="cyan"
                                            cx="12.5"
                                            cy="12.5"
                                        />
                                        <svg
                                            fill="indigo"
                                            xmlns="http://www.w3.org/2000/svg"
                                            x={12.5 - 8.5}
                                            y={12.5 - 8.5}
                                            width={"17"}
                                            height="17"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                            <path d="M0 0h24v24H0z" fill="none" />
                                        </svg>
                                    </svg>

                                    {node.depth > 0 && (
                                        <svg
                                            width="25"
                                            height="25"
                                            x={width / 2 - 12.5}
                                            y={0}
                                        >
                                            <circle
                                                r="12.5"
                                                fill="cyan"
                                                cx="12.5"
                                                cy="12.5"
                                            />
                                            <svg
                                                fill="red"
                                                xmlns="http://www.w3.org/2000/svg"
                                                x={12.5 - 8.5}
                                                y={12.5 - 8.5}
                                                width={"17"}
                                                height="17"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                <path
                                                    d="M0 0h24v24H0z"
                                                    fill="none"
                                                />
                                            </svg>
                                        </svg>
                                    )}
                                </>
                            )}
                        </>
                    );
                }}
            />
        );
    }
}
export default CustomizedView;
