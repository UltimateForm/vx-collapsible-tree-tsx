import { TreeNode } from "./types";
import { HierarchyNode, HierarchyLink } from "d3-hierarchy";
import * as React from "react";
import { string } from "prop-types";
import { INode } from "@vx/network";

export interface TreeNodeData {
	id?: string | number;
	name: string;
	children?: TreeNodeData[];
	isExpanded?: boolean;
	x0?: number;
	y0?: number;
	renderWidth?: number;
	renderHeight?: number;
	[key: string]: any;
}
export interface TreeNode extends HierarchyNode<TreeNodeData>, INode {}

export interface DataOperations {
	addNode?: (parent: TreeNode) => TreeNode;
	removeNode?: (node: TreeNode) => TreeNode;
}

export interface NodeEvents {
	onNodeClick?: (
		event: React.MouseEvent<SVGRectElement, MouseEvent>,
		node: TreeNode
	) => void;
	onNodeDoubleClick?: (
		event: React.MouseEvent<SVGRectElement, MouseEvent>,
		node: TreeNode
	) => void;
	onNodeHover?: (
		event: React.MouseEvent<SVGRectElement, MouseEvent>,
		node: TreeNode
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

export interface TreeProps extends DataOperations, NodeEvents {
	data: TreeNodeData;
	width: number;
	height: number;
	margin?: Anchors;
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

export interface NodesMoveProps {
	nodes: TreeNode[];
	layout: string;
	orientation: string;
	onNodeClick?: (node: TreeNode) => void;
}

export interface NodeProps {
	node: TreeNode;
	onClick: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
		node: TreeNode
	) => void;
}
