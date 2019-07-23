import React, { Fragment, Component, FC } from "react";
import { Group } from "@vx/group";
import NodeGroup from "react-move/NodeGroup";
import Node from "./Node";
import { findCollapsedParent, getTopLeft } from "./utils";
import { NodesMoveProps, Vector2, TreeNode, NodeEvents } from "./types";

class NodesMove extends Component<NodesMoveProps> {
	constructor(props: NodesMoveProps) {
		super(props);
	}

	prioritizedData: any[] | undefined = undefined;
    renderRects: Vector2[] | undefined = undefined;

    compareRects= () =>{
		//checks if positions are optimized for sizes, if not, rerenders
		const newRenderRects: Vector2[] = this.props.nodes.map(i => ({
			x: i.data.renderWidth!,
			y: i.data.renderHeight!
        }));
		if (!this.renderRects) return;
		if (this.renderRects === newRenderRects) return; //old comment on old impl was "dont worry node-group already handles it https://react-move.js.org/#/component-api/node-group" and im too afraid of deleting it now

		for (let i = 0; i < this.renderRects.length; i++) {
			if (
				this.renderRects[i].x !== newRenderRects[i].x ||
				this.renderRects[i].y !== newRenderRects[i].y
			) {
				this.prioritizedData = [...this.props.nodes];
				this.forceUpdate();
				return;
			}
		}
		this.prioritizedData = undefined;
    }
    componentDidMount(){
        this.compareRects();
    }
	componentDidUpdate(prevProps: NodesMoveProps) {
        const oldData = prevProps.nodes;
		if (!oldData) return;
        this.compareRects();
	}

	render() {
		const { nodes, layout, orientation, onNodeClick, operations, nodeChildren } = this.props;
		this.renderRects = nodes.map(i => ({
			x: i.data.renderWidth!,
			y: i.data.renderHeight!
        }));
		return (
			<NodeGroup
				data={this.prioritizedData || nodes}
				keyAccessor={d => d.data.name}
				start={node => {
					const parentTopLeft = getTopLeft(
						node.parent || { x: 0, y: 0 },
						layout,
						orientation
					);
					return {
						top: parentTopLeft.top,
						left: parentTopLeft.left,
						opacity: 0
					};
				}}
				enter={node => {
					const topLeft = getTopLeft(node, layout, orientation);
					return {
						top: [topLeft.top],
						left: [topLeft.left],
						opacity: [1]
					};
				}}
				update={node => {
					const topLeft = getTopLeft(node, layout, orientation);
					return {
						top: [topLeft.top],
						left: [topLeft.left],
						opacity: [1]
					};
				}}
				leave={node => {
					const collapsedParent = findCollapsedParent(node.parent);
					const collapsedParentPrevPos:TreeNode = {
                        ...collapsedParent!,//assume not null because root (only parentless node, will never leave)
						x: collapsedParent!.data.x0 || collapsedParent!.x,
						y: collapsedParent!.data.y0 || collapsedParent!.y
					};
					const topLeft = getTopLeft(
						collapsedParentPrevPos,
						layout,
						orientation
					);
					return {
						top: [topLeft.top],
						left: [topLeft.left],
						opacity: [0]
					};
				}}
			>
				{nodes => (
					<Group>
						{nodes.sort((x, y)=>Number(x.data.data.selected||0)-Number(y.data.data.selected||0)).map(({ key, data: node, state }) => {
							const width = 40;
                            const height = 20;
                            // console.log(nodes.sort((x, y)=>Number(x.data.data.selected||0)-Number(y.data.data.selected||0)))
							return (
								<Group
									top={state.top}
									left={state.left}
									key={key}
									opacity={state.opacity}
								>
									<Node
                                        operations={operations}
										node={node}
                                        key={key}
                                        children={nodeChildren}
                                        {...(this.props as NodeEvents)}
									/>
								</Group>
							);
						})}
					</Group>
				)}
			</NodeGroup>
		);
	}
}

export default NodesMove;