import React, { Fragment } from "react";
import { Group } from "@vx/group";
import NodeGroup from "react-move/NodeGroup";
import Node from "./Node";
import { findCollapsedParent, getTopLeft } from "./utils";

class Nodes extends React.Component {
	prioritizedData = undefined;
    renderRects = undefined;
    
	componentDidUpdate(prevProps, prevState) { //checks if positions are optimized for sizes, if not, rerenders
        const oldData = prevProps.nodes;
        if (!oldData) return;
        const newRenderRects = this.props.nodes.map(i => ({
            x: i.data.renderWidth,
            y: i.data.renderHeight
        }));
		if (this.renderRects === newRenderRects) return; //dont worry node-group already handles it https://react-move.js.org/#/component-api/node-group

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


	render() {
		const { nodes, layout, orientation, onNodeClick } = this.props;
        this.renderRects = nodes.map(i => ({
			x: i.data.renderWidth,
			y: i.data.renderHeight
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
					const collapsedParentPrevPos = {
						x: collapsedParent.data.x0,
						y: collapsedParent.data.y0
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
						{nodes.map(({ key, data: node, state }) => {
							const width = 40;
							const height = 20;
							return (
								<Group
									top={state.top}
									left={state.left}
									key={key}
									opacity={state.opacity}
								>
									<Node
										onBuilt={() => {}}
										node={node}
										layout={layout}
										orientation={orientation}
										onClick={() => onNodeClick(node)}
										key={key}
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

export default Nodes;
