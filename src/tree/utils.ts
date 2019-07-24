import { TreeNode } from './types';
import { pointRadial } from "d3-shape";

export const findCollapsedParent =(node:TreeNode):TreeNode|null=> {
	if (!node.data.isExpanded || !node.parent) {
		return node;
	} else if (node.parent) {
		return findCollapsedParent(node.parent);
	} else {
		return null;
	}
}

export const getTopLeft = (node:TreeNode, layout:string, orientation:string) => {

	if (layout === "polar") {
		const [radialX, radialY] = pointRadial(node.x, node.y);
		return {
			top: radialY,
			left: radialX
		};
	} else if (orientation === "vertical") {
		return {
			top: node.y - ((node.data && (node.depth===0? -1*node.data.renderWidth!:node.data.renderHeight!)/2)|| 0),
			left: node.x 
		};
	} else {
		return {
			top: node.x,
			left: node.y - ((node.depth===0? -1:1)*(node.data && node.data.renderWidth! / 2) || 0)
		};
	}
}
