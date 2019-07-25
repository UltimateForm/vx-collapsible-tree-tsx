import { TreeProps, TreeNodeData, TreeNode } from "./types";
import React, { FC, useState } from "react";
import Tree from "./Tree";
import ScaledTree from "./ScaledTree";
import data from "./data";
import shortId from "shortid";
import {useSpring, animated} from 'react-spring'
export { default as ScaledTree } from "./ScaledTree";

const DefaultView: FC = props => {
	return <Tree data={data} width={600} height={500} />;
};

const AnimatedPlus: FC = () => {
    const cicleSpring = useSpring({r: 12.5, from: {r:0,}, })
    const plusSpring =useSpring({width:17, height:17, x:4,y:4, from: {width:0, height:0, x:12.5, y:12.5}})
	return (
		<>
			<animated.circle
				r={cicleSpring.r}
				fill="cyan"
				cx="12.5"
				cy="12.5"
			/>
			<animated.svg
				fill="indigo"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				{...plusSpring}
			>
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
				<path d="M0 0h24v24H0z" fill="none" />
			</animated.svg>
		</>
	);
};
const AnimatedBin: FC = () => {
    const cicleSpring = useSpring({r: 12.5, from: {r:0,}, })
    const plusSpring =useSpring({width:17, height:17, x:4,y:4, from: {width:0, height:0, x:12.5, y:12.5}})
	return (
		<>
			<animated.circle
				r={cicleSpring.r}
				fill="cyan"
				cx="12.5"
				cy="12.5"
			/>

			<animated.svg
				fill="red"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				{...plusSpring}
			>
				<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
				<path d="M0 0h24v24H0z" fill="none" />
			</animated.svg>
		</>
	);
};
class CustomizedView extends React.Component {
    constructor (props:{[key:string]:any}) {
        super(props)
        this.state={
            data:{ name: "root", id:shortId.generate() },
            selected:null
        }
    }
    
    state:{
        data:TreeNodeData
        selected:TreeNode|null
    };

    render() {
        const {
            props,
        } = this;

        return (
            <ScaledTree
                data={this.state.data}
                onCanvasClick={(e, operations)=>{
                    if(this.state.selected){
                        this.state.selected.data.selected=false;
                    }
                    this.setState({selected:null});
                    operations && operations.expandAll && operations.expandAll();
                }}
                width={600}
                height={500}
                onNodeClick={(e, node, operations) =>{
                    if(this.state.selected){
                        this.state.selected.data.selected=false;
                    }
                    node.data.selected=true;
                    const path:(string|number)[] = [];
                    if(operations && operations.expandNode ){
                        const ancestors = node.ancestors();
                        operations.expandNode&&operations.expandNode(node);
                        operations.collapseAll&&operations.collapseAll((n)=>!ancestors.includes(n as TreeNode));
                    }
                    
                    this.setState({selected:node});
                }}
                nodeChildren={(node, ops) => {
                    if(!node.data.selected)return undefined;
                    const width = node.data.renderWidth || 0;
                    const height = node.data.renderHeight || 0;

                    return (
						<>
							{node.data.selected && (
								<>
									<svg
										width="25"
										height="25"
										x = {node.depth > 0 ? -(width / 2) - 12.5 : -25 / 2}
										onClick={ev => {
											ev.preventDefault();
											const selected = this.state.selected;
											selected!.children = selected!.children || [];
											if (ops.addNode) selected!.children.push(ops.addNode(node));
										}}
										y = {node.depth>0? 0 : width/2 - 25/2}
									>
                                        <AnimatedPlus/>
									</svg>

									{node.depth > 0 && (
										<svg
											width="25"
											height="25"
											x={width/2 - 12.5}
											y={0}
											onClick={ev => {
												ev.preventDefault();
												const selected = this.state.selected;
												if (ops.removeNode && selected) this.setState({selected: ops.removeNode(selected)});
											}}
										>
                                            <AnimatedBin/>
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
