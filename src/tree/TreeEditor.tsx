import React, {FC} from 'react';
import shortId from "shortid";
import {useSpring, animated} from 'react-spring';
import ScaledTree from "./ScaledTree";
import { TreeProps, TreeNodeData, TreeNode } from "./types";
import { getPath } from './utils';

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

interface IState{
    selected:TreeNode|null
};
interface TreeEditorProps extends TreeProps{
    onSelected?:(node:TreeNode)=>void;
    change?:(source:string, value:any)=>void;
}
class TreeEditor extends React.Component<TreeEditorProps, IState> {
    constructor (props:TreeEditorProps) {
        super(props)
        this.state = {
			selected: null
        };
    }

    data:TreeNodeData={ name: "root gay", id: shortId.generate() };

    render() {
        const {
            props,
        } = this;
        const localdata = props.data||this.data;
        return (
            <ScaledTree
                data={localdata}
                onChange={(src, value, data)=>props.change && props.change(src, value)}
                onCanvasClick={(e, operations)=>{
                    operations && operations.expandAll && operations.expandAll();
                    if(this.state.selected){
                        this.state.selected.data.selected=false;
                        if(props.change){
                            const src = getPath(this.state.selected, 'selected');
                            props.change && props.change(src,false);
                        }
                    }
                    this.setState({selected:null});
                }}
                width={600}
                height={500}
                onNodeClick={(e, node, operations) =>{
                    if(operations){
                        const ancestors = node.ancestors();
                        !node.data.isExpanded && operations.expandNode && operations.expandNode(node);
                        operations.collapseAll&&operations.collapseAll((n)=>!ancestors.some((a)=>a.data.id===n.data.id));
                    }

                    if(this.state.selected){
                        this.state.selected.data.selected=false;
                        if(props.change){
                            const src = getPath(this.state.selected, 'selected');
                            props.change && props.change(src,false);
                        }
                    }

                    node.data.selected=true;
                    this.setState({selected:node}, ()=>{
                        props.onSelected && props.onSelected(node);
                        if(props.change){
                            const src = getPath(node, 'selected');
                            props.change && props.change(src,true);
                        }
                    });
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
                                            if (ops.addNode) {
                                                selected!.children.push(ops.addNode(node));
                                            }                 
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
                                                if (ops.removeNode && selected){
                                                    const parent = ops.removeNode(selected);
                                                    parent.data.selected = true;
                                                    this.setState({selected: parent});
                                                    console.log("Removed lol", localdata)
                                                    props.change && props.change("children",localdata.children);                                                } 
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

export default TreeEditor;