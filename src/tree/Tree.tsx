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
import { getPath } from "./utils";

const useForceUpdate = () => {
	const [, setState] = React.useState();
	return setState;
};

const selectedRoute = (node:TreeNode):(string|number)[] => {
    const route:(string|number)[] = [];
    node.ancestors().forEach(i=>route.push(i.data.id!))
    return route;
};

type Layout = 'cartesian' | 'polar';
type Orientation = 'horizontal' | 'vertical';
type Link = 'diagonal' | 'step' | 'curve' | 'line' | 'elbow';

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
        nodeChildren,
        onChange
	} = props;

	const [layout, setlayout] = React.useState<Layout>("cartesian");
	const [orientation, setOrientation] = React.useState<Orientation>("horizontal");
	const [linkType, setLinkType] = React.useState<Link>("diagonal");
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
				x: (innerWidth / 2)+24, //not completely sure why i have to do this but works
				y: (innerHeight / 2)+24
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
	// const [root, routeSelected] = React.useMemo(() => {
    //     const newRoot = hierarchy(data, d => (d.isExpanded ? d.children : null));
    //     let rs:(string|number)[] = [];
    //     const selectedNode = newRoot.descendants().find(i=>i.data.selected) as TreeNode;
    //     if(selectedNode)rs=selectedRoute(selectedNode);
	// 	return [newRoot, rs];
    // }, [JSON.stringify(data)]);
    const root = hierarchy(data, d => (d.isExpanded ? d.children : null));
    let routeSelected:(string|number)[] = [];
    let rs:(string|number)[] = [];
    const selectedNode = root.descendants().find(i=>!!i.data.selected) as TreeNode;
    if(selectedNode)routeSelected=selectedRoute(selectedNode);
    // JSON.stringify(data) //shit son
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
                    if(onChange){
                        onChange(getPath(node, 'expanded'), true, node.data);
                        let src = getPath(node, 'children');
                        onChange(src, node.data.children, node.data);
                    }
                    forceRefresh();
					return node;
				},
			removeNode:
				props.removeNode ||
				function(node) {
                    const parentNode = node.parent;
                    if(!parentNode || !parentNode.data.children)throw `Expected defined parent with defined children but got ${parentNode}`
                    parentNode.data.children = parentNode.data.children.filter(i=>i.id!==node.data.id)
                    parentNode.children = parentNode.children!.filter(i=>i.data.id!==node.data.id)
                    // node.parent=null; //was causing exceptions, check utils.findCollapsedParent
                    if(onChange){
                        let src = getPath(parentNode, 'children');
                        onChange(src, parentNode.data.children, parentNode.data);
                    }
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
                    if(onChange){
                        let src = getPath(node, 'isExpanded');
                        onChange(src, node.data.isExpanded , node.data);
                    }
                    forceRefresh();
					return node;
                },
            collapseAll:
                props.collapseAll ||
                function(selector){
                    if(!root.children || root.children.length===0)return root as TreeNode;
                    const descendants = root.descendants();
                    descendants.forEach((i)=>{
                        const node = i as TreeNode;
                        node.data.isExpanded=selector===undefined? false : !selector(node); 
                        //tried with the pretty way, more readable like this
                    })
                    if(onChange){
                        if(selector===undefined || selector(root as TreeNode))onChange('isExpanded', false, root.data);
                        let src = 'children';
                        onChange(src, [...(root.data.children||[])], root.data);
                    }
                    return root as TreeNode;
                    
                },
            expandAll:
                props.expandAll ||
                function(selector){
                    if(!data.children || data.children.length===0){
                        onChange && onChange('isExpanded', true, root.data);
                        return root as TreeNode;
                    }
                    const mockRoot = hierarchy(data);
                    mockRoot.descendants().forEach((i)=>{
                        (i as TreeNode).data.isExpanded=selector===undefined? true : selector(i as TreeNode); 
                    })
                    if(onChange){
                        if(selector===undefined || selector(mockRoot as TreeNode))onChange('isExpanded', true, root.data);
                        let src = 'children';
                        onChange(src, [...(mockRoot.data.children||[])], mockRoot.data);
                    }
                    return mockRoot as TreeNode;
                }
		};
    }, [{...props as TreeOperations}]);
    props.onOpsReady && props.onOpsReady(operations);
	return (
		<div>
			<div>
				<label>layout:</label>
				<select
					onChange={e => setlayout(e.target.value as Layout)}
					value={layout}
				>
					<option value="cartesian">cartesian</option>
					<option value="polar">polar</option>
				</select>

				<label>orientation:</label>
				<select
					onChange={e => setOrientation(e.target.value as Orientation)}
					value={orientation}
					disabled={layout === "polar"}
				>
					<option value="vertical">vertical</option>
					<option value="horizontal">horizontal</option>
				</select>

				<label>link:</label>
				<select
					onChange={e => setLinkType(e.target.value as Link)}
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
                    id="vxTree_canvas"
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
                                    onNodeChange={(src, value, node)=>onChange && onChange(getPath(node, src), value, node.data)}
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
