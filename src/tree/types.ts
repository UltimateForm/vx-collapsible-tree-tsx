import { HierarchyNode, HierarchyLink } from "d3-hierarchy";
import * as React from "react";
import { INode } from "@vx/network";

export interface TreeNodeData {
	id?: string | number;
	name: string;
	children?: TreeNodeData[];
    isExpanded?: boolean;
    selected?:boolean;
	x0?: number;
	y0?: number;
	renderWidth?: number;
	renderHeight?: number;
	[key: string]: any;
}
export interface TreeNode extends HierarchyNode<TreeNodeData>, INode {}

export interface TreeOperations {
	addNode?: (parent: TreeNode) => TreeNode;
    removeNode?: (node: TreeNode) => TreeNode;
    expandNode?: (node:TreeNode) => TreeNode;
}

export interface NodeEvents {
	onNodeClick?: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
        node: TreeNode,
        operations?:TreeOperations
	) => void;
	onNodeDoubleClick?: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
        node: TreeNode,
        operations?:TreeOperations
	) => void;
	onNodeHover?: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
        node: TreeNode,
        operations?:TreeOperations
    ) => void;
    onNodeMouseLeave?: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
        node: TreeNode,
        operations?:TreeOperations
    ) => void;
    onNodeMouseEnter?: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
        node: TreeNode,
        operations?:TreeOperations
	) => void;
}
export interface Vector2 {
	x: number;
	y: number;
}
export interface Anchors {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface TreeProps extends TreeOperations, NodeEvents {
	data: TreeNodeData;
	width: number;
	height: number;
    margin?: Anchors;
    nodeChildren?:(node:TreeNode, ops:TreeOperations)=>any;

}
export interface TreeState {
	layout: string;
	orientation: string;
	linkType: string;
	stepPercent: number;
}
export interface LinksProps extends TreeState {
	//don't worry about it
	links: HierarchyLink<any>[];
}

export interface LinkProps extends TreeState {
	data: any; //need to check type later
	stroke: string; //color
	strokeWidth: string;
	fill: string;
	key: any; //need to check type later
}

export interface NodesMoveProps extends NodeEvents {
	nodes: TreeNode[];
	layout: string;
    orientation: string;
    operations: TreeOperations;
    nodeChildren?:(node:TreeNode, ops:TreeOperations)=>any;
}

export interface NodeProps extends NodeEvents{
    node: TreeNode;
    operations: TreeOperations;
    children?:(node:TreeNode, ops:TreeOperations)=>any;
}
