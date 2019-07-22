import React, {
	Fragment,
	FC,
	useState,
	useRef,
	useLayoutEffect
} from "react";
import { NodeProps, Vector2 } from "./types";

const rectOffset:Vector2 = {
	x: 20,
	y: 15
};

const Node: FC<NodeProps> = props => {
	const { node, onClick } = props;
	const [rect, setRect] = useState<Vector2 | undefined>(undefined);
	const width = rect && rect.x || 20;
    const height = rect && rect.y || 20;
    
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
	return (
		<Fragment>
			{node.depth === 0 && (
				<circle r={width / 2} fill="url('#lg')" onClick={(e)=>onClick(e, node)} />
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
					onClick={(e)=>onClick(e, node)}
				/>
			)}
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