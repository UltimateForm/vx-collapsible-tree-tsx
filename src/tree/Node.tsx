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
        operations
	} = props;
	const [rect, setRect] = useState<Vector2 | undefined>(undefined);
	const width = (rect && rect.x) || 20;
	const height = (rect && rect.y) || 20;

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
    }, [refCallback]);
    const events = React.useMemo<NodeEvents>(()=>{
        return{
             onNodeClick:props.onNodeClick||function(ev, node, ops){
                ev.stopPropagation();
                ops!.expandNode!(node);
            },
            onNodeDoubleClick:props.onNodeDoubleClick||function(ev, node, ops){
                ev.stopPropagation();
                console.log("onNodeDoubleClick undefined")
            },
            onNodeHover:props.onNodeHover||function(ev, node, ops){

            },
            onNodeMouseEnter:props.onNodeMouseEnter||function(ev, node, ops){
            },
            onNodeMouseLeave:props.onNodeMouseLeave||function(ev, node, ops){
            }
        }
    }, [props.onNodeClick, props.onNodeDoubleClick, props.onNodeHover, operations]);
    
	return (
		<Fragment>
			{node.depth === 0 && (
				<circle
					r={width / 2}   
                    fill="url('#lg')"                    
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
					fill={"#272b4d"}
					stroke={node.data.children ? "#03c0dc" : "#26deb0"}
					strokeWidth={1}
					strokeDasharray={!node.data.children ? "2,2" : "0"}
					strokeOpacity={!node.data.children ? 0.6 : 1}
					rx={!node.data.children ? 10 : 0}
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
				fill={
					node.depth === 0
						? "#71248e"
						: node.children
						? "white"
						: "#26deb0"
				}
			>
				{node.data.name}
			</text>
		</Fragment>
	);
};

export default Node;
