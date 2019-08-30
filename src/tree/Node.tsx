import React, { Fragment, FC, useState, useRef, useLayoutEffect, cloneElement } from "react";
import { NodeProps, Vector2, NodeEvents } from "./types";

const rectOffset: Vector2 = {
	x: 20,
	y: 15
};

const Node: FC<NodeProps> = props => {
	const {
	    node,
	    onNodeClick,
	    onNodeDoubleClick,
	    onNodeHover,
	    onNodeMouseEnter,
        onNodeMouseLeave,
        children,
        operations,
        onNodeChange
	} = props;
	const [rect, setRect] = useState<Vector2 | undefined>(undefined);
	const width = (rect && rect.x) || 20;
	const height = (rect && rect.y) || 20;

    const events = React.useMemo<NodeEvents>(() => {
		return {
            onNodeChange:props.onNodeChange || function(source, value, node) {
                console.log(`TREE.NODE Changed ${source} to ${value} on node ${node.data.id}`)
            },
			onNodeClick:
				props.onNodeClick ||
				function(ev, node, ops) {
					ev.stopPropagation();
					ops!.expandNode!(node);
				},
			onNodeDoubleClick:
				props.onNodeDoubleClick ||
				function(ev, node, ops) {
					ev.stopPropagation();
					console.log("onNodeDoubleClick undefined");
				},
			onNodeHover: props.onNodeHover || function(ev, node, ops) {},
			onNodeMouseEnter:
				props.onNodeMouseEnter || function(ev, node, ops) {},
			onNodeMouseLeave:
				props.onNodeMouseLeave || function(ev, node, ops) {}
		};
    }, [props.onNodeClick,props.onNodeDoubleClick,props.onNodeHover,operations]);

    const refCallback = useRef<SVGTextElement>(null);

    useLayoutEffect(() => {
		//see https://github.com/hshoff/vx/issues/375
		if (!refCallback.current) return;
		const elementRect = refCallback.current.getBoundingClientRect();
		setRect({
			x: elementRect.width + rectOffset.x,
			y: elementRect.height + rectOffset.y
		});
		node.data.renderWidth = elementRect.width + rectOffset.x;
        node.data.renderHeight = elementRect.height + rectOffset.y;
        events.onNodeChange('renderWidth', node.data.renderWidth, node);
        events.onNodeChange('renderHeight', node.data.renderHeight, node);
    }, [refCallback, node.data.name]);

	return (
		<Fragment>
			{node.depth === 0 && (
				<circle
					r={width / 2}   
                    fill="#ffffff"
                    stroke={node.data.children && node.data.children.length>0 ? '#00ffd8' : '#26deb0'}              
                    onClick={e => events.onNodeClick && events.onNodeClick(e, node, operations)}
                    onDoubleClick={e=>events.onNodeDoubleClick && events.onNodeDoubleClick(e, node, operations)}
                    onMouseMove={e=>events.onNodeHover && events.onNodeHover(e, node, operations)}
                    onMouseEnter={e=>events.onNodeMouseEnter && events.onNodeMouseEnter(e, node, operations)}
                    onMouseLeave ={e=>events.onNodeMouseLeave && events.onNodeMouseLeave(e, node, operations)}
				/>
			)}
			{node.depth !== 0 && (
				<rect
					height={height}
					width={width}
					y={-height / 2}
                    x={-width / 2}
                    fill={node.data.selected?" #ffffff": '#272b4d'}
                    stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                    strokeWidth={node.data.selected? 1.25 : 1}
                    strokeDasharray={node.data.children && node.data.children.length>0? '0': '2,2'}
                    strokeOpacity={node.data.children  && node.data.children.length>0? 1 : 0.6}
                    rx={node.data.children && node.data.children.length>0? 0 : 10}
                    onClick={e => events.onNodeClick && events.onNodeClick(e, node, operations)}
                    onDoubleClick={e=>events.onNodeDoubleClick && events.onNodeDoubleClick(e, node, operations)}
                    onMouseMove={e=>events.onNodeHover && events.onNodeHover(e, node, operations)}
                    onMouseEnter={e=>events.onNodeMouseEnter && events.onNodeMouseEnter(e, node, operations)}
                    onMouseLeave ={e=>events.onNodeMouseLeave && events.onNodeMouseLeave(e, node, operations)}
				/>
            )}
            {children && children(node, operations)}
			<text
				dy={".33em"}
				fontSize={9}
				fontFamily="Arial"
				textAnchor={"middle"}
				style={{ pointerEvents: "none" }}
				ref={refCallback}
                fill={node.depth === 0 ? '#71248e' : node.children && node.children.length>0 ? (node.data.selected? '#71248e' :'white') : ('#26deb0')}
			>
				{node.data.name}
			</text>
		</Fragment>
	);
};

export default Node;
