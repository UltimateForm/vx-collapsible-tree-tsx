import React, {
	Fragment,
	useState,
	useRef,
	useMemo,
	useEffect,
	useLayoutEffect
} from "react";
import { Group } from "@vx/group";

const rectOffset = {
	width: 10,
	height: 5
};

function Node({ node, onClick, onBuilt }) {
	const [rect, setRect] = useState({});
	const width = rect.x | 20;
	const height = rect.y | 20;
	const refCallback = useRef(null);
	useLayoutEffect(() => {
		console.log("set rect>>", refCallback.current);

		if (!refCallback.current) return;
		const elementRect = refCallback.current.getBoundingClientRect();
		setRect({
			x: elementRect.width + rectOffset.width,
			y: elementRect.height + rectOffset.height
		});
		node.data.renderWidth = elementRect.width + rectOffset.width;
		node.data.renderHeight = elementRect.height + rectOffset.height;
		console.log("set rect", refCallback);
	}, [refCallback]);
	useMemo(() => {
        console.log("XX", rect)
		if (rect.x && rect.y) {
			onBuilt();
		}
	}, [rect.x, rect.y]);
	console.log("this size", rect);
	return (
		<Fragment>
			{node.depth === 0 && (
				<circle r={width / 2} fill="url('#lg')" onClick={onClick} />
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
					onClick={onClick}
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
}

export default Node;
