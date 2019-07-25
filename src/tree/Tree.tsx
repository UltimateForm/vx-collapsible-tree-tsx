import * as React from "react";
import { Group } from "@vx/group";
import { Tree, INode } from "@vx/hierarchy";
import { LinearGradient } from "@vx/gradient";
import { hierarchy } from "d3-hierarchy";
import Links from "./Links";
import Nodes from "./Nodes";
import _ from "lodash";
import { TreeProps, Vector2, TreeNode, TreeOperations, NodeEvents } from "./types";
import shortId from "shortid";

const useForceUpdate = () => {
	const [, setState] = React.useState();
	return setState;
};

const selectedRoute = (node:TreeNode):(string|number)[] => {
    const route:(string|number)[] = [];
    node.ancestors().forEach(i=>route.push(i.data.id!))
    return route;
};

const TreeView: React.FC<TreeProps> = (props: TreeProps) => {
	const {
		data,
		width,
		height,
		margin = {
			top: 24,
			left: 24,
			right: 24,
			bottom: 24
		},
        onCanvasClick,
        onCanvasDoubleClick,
        onCanvasHover,
        onCanvasMouseEnter,
        onCanvasMouseLeave,
        nodeChildren
	} = props;

	const [layout, setlayout] = React.useState<string>("cartesian");
	const [orientation, setOrientation] = React.useState<string>("horizontal");
	const [linkType, setLinkType] = React.useState<string>("diagonal");
	const [stepPercent, setStepPercent] = React.useState<number>(0.5);
	const [r, forceUpdate] = React.useState<boolean>(false); //i know...

	const [effectiveWidth, effectiveHeight] = React.useMemo(() => {
		const fHeight = height - 28;
		const fWidth = width;
		return [fWidth, fHeight];
	}, [width, height]);

	const [innerWidth, innerHeight] = React.useMemo(() => {
		const iWidth = effectiveWidth - margin.left - margin.right;
		const iHeight = effectiveHeight - margin.top - margin.bottom;
		return [iWidth, iHeight];
	}, [effectiveWidth, effectiveHeight, margin]);

	const { origin, sizeWidth, sizeHeight } = React.useMemo(() => {
		let origin: Vector2;
		let sizeWidth: number;
		let sizeHeight: number;
		if (layout === "polar") {
			origin = {
				x: innerWidth / 2,
				y: innerHeight / 2
			};
			sizeWidth = 2 * Math.PI;
			sizeHeight = Math.min(innerWidth, innerHeight) / 2;
		} else {
			if (orientation === "vertical") {
				origin = { x: margin.top, y: margin.right };
				sizeWidth = innerWidth;
				sizeHeight = innerHeight;
			} else {
				origin = { x: margin.left, y: margin.top };
				sizeWidth = innerHeight;
				sizeHeight = innerWidth;
			}
		}
		return {
			origin,
			sizeWidth,
			sizeHeight
		};
    }, [layout, innerWidth, innerHeight, orientation]);
	const [root, routeSelected] = React.useMemo(() => {
        const newRoot = hierarchy(data, d => (d.isExpanded ? d.children : null));
        let rs:(string|number)[] = [];
        const selectedNode = newRoot.descendants().find(i=>i.data.selected) as TreeNode;
        if(selectedNode)rs=selectedRoute(selectedNode);
		return [newRoot, rs];
    }, [JSON.stringify(data)]);
	const forceRefresh = () => {
		forceUpdate(prev => !prev); 
    };
	const operations = React.useMemo<TreeOperations>(() => {
		return {
			addNode:
				props.addNode ||
				function(node) {
					node.data.children = [
						...(node.data.children || []),
						{
							name: `${node.data.name}.${(node.data.children &&
								node.data.children.length) ||
                                0}`,
                            id:shortId.generate()
						}
                    ];
                    node.data.isExpanded= true;
                    forceRefresh();
					return node;
				},
			removeNode:
				props.removeNode ||
				function(node) {
                    const parentNode = node.parent;
                    if(!parentNode || !parentNode.data.children)throw `Expected defined parent with defined children but got ${parentNode}`
                    parentNode.data.children = parentNode.data.children.filter(i=>i.name!==node.data.name)
                    parentNode.children = parentNode.children!.filter(i=>i.data.name!==node.data.name)
                    node.parent=null;
					return parentNode;
				},
			expandNode:
				props.expandNode ||
				function(node) {
					if (!node.data.isExpanded) {
						node.data.x0 = node.x;
						node.data.y0 = node.y;
					}
                    node.data.isExpanded = !node.data.isExpanded;
					forceRefresh();
					return node;
                },
            collapseAll:
                props.collapseAll ||
                function(selector){
                    root.descendants().forEach((i)=>{
                        (i as TreeNode).data.isExpanded=selector===undefined? false : !selector(i as TreeNode); 
                        //tried with the pretty way, more readable like this
                    })
                    return root as TreeNode;
                    
                },
            expandAll:
                props.expandAll ||
                function(selector){
                    root.descendants().forEach((i)=>{
                        (i as TreeNode).data.isExpanded=selector===undefined? true : selector(i as TreeNode); 
                    })
                    return root as TreeNode;
                }

		};
    }, [{...props as TreeOperations}]);

	return (
		<div>
			<div>
				<label>layout:</label>
				<select
					onChange={e => setlayout(e.target.value)}
					value={layout}
				>
					<option value="cartesian">cartesian</option>
					<option value="polar">polar</option>
				</select>

				<label>orientation:</label>
				<select
					onChange={e => setOrientation(e.target.value)}
					value={orientation}
					disabled={layout === "polar"}
				>
					<option value="vertical">vertical</option>
					<option value="horizontal">horizontal</option>
				</select>

				<label>link:</label>
				<select
					onChange={e => setLinkType(e.target.value)}
					value={linkType}
				>
					<option value="diagonal">diagonal</option>
					<option value="step">step</option>
					<option value="curve">curve</option>
					<option value="line">line</option>
					<option value="elbow">elbow</option>
				</select>

				<label>step:</label>
				<input
					type="range"
					min={0}
					max={1}
					step={0.1}
					onChange={e => setStepPercent(Number(e.target.value))}
					value={stepPercent}
					disabled={linkType !== "step" || layout === "polar"}
				/>
			</div>

            <svg 
                width={effectiveWidth}
                height={effectiveHeight}
            >
				<LinearGradient id="lg" from="#fd9b93" to="#fe6e9e" />
				<rect
					width={effectiveWidth}
					height={effectiveHeight}
					rx={14}
                    fill="#272b4d"
                    onClick={(e)=>onCanvasClick&&onCanvasClick(e, operations)}
                    onDoubleClick={(e)=>onCanvasDoubleClick&&onCanvasDoubleClick(e, operations)}
                    onMouseMove={(e)=>onCanvasHover&&onCanvasHover(e, operations)}
                    onMouseEnter={(e)=>onCanvasMouseEnter&&onCanvasMouseEnter(e, operations)}
                    onMouseLeave={(e)=>onCanvasMouseLeave&&onCanvasMouseLeave(e, operations)}
				/>
				<Tree
					top={origin.y}
					left={origin.x}
					root={root}
					size={[sizeWidth, sizeHeight]}
					separation={(a: any, b: any) =>
						(a.parent == b.parent ? 1 : 0.5) / a.depth
					}
				>
					{(data: TreeNode) => {
						return (
							<Group top={origin.y} left={origin.x}>
								<Links
									links={data.links()}
									linkType={linkType}
									layout={layout}
									orientation={orientation}
                                    stepPercent={stepPercent}
                                    selectedRoute={routeSelected}
								/>

								<Nodes
									nodes={data.descendants()}
									layout={layout}
                                    orientation={orientation}
                                    operations={operations}
                                    nodeChildren={nodeChildren}
                                    {...props as NodeEvents}
								/>
							</Group>
						);
					}}
				</Tree>
			</svg>
		</div>
	);
};

export default TreeView;
