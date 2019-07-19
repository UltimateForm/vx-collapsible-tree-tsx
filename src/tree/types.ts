import * as React from "react";

export interface TreeNode {
	name: String | Number;
	children?: TreeNode[];
	[key: string]: any;
}

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
export interface Vector2{
    x:number;
    y:number;
}
export interface Anchors {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface TreeProps extends DataOperations, NodeEvents {
	data: TreeNode;
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
