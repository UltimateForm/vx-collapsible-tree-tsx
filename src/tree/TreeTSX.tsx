import * as React from "react";
import { Group } from "@vx/group";
import { Tree } from "@vx/hierarchy";
import { LinearGradient } from "@vx/gradient";
import { hierarchy } from "d3-hierarchy";
// import Links from './Links';
import Links from "./LinksMove";
// import Nodes from './Nodes';
import Nodes from "./NodesMove";
import { TreeProps, Vector2, Anchors } from "./types";
import { bool } from "prop-types";

const useForceUpdate = () => {
	const [, setState] = React.useState();
	return setState;
};

const TreeView: React.FC<TreeProps> = (props: TreeProps) => {
	const {
		data,
		width,
		height,
		margin = {
			top: 24,
			left: 24,
			right: 24,
			bottom: 24
		}
	} = props;

	const [layout, setlayout] = React.useState<string>("cartesian");
	const [orientation, setOrientation] = React.useState<string>("horizontal");
	const [linkType, setLinkType] = React.useState<string>("diagonal");
	const [stepPercent, setStepPercent] = React.useState<number>(0.5);
	const [r, forceUpdate] = React.useState<boolean>(false);

	const [effectiveWidth, effectiveHeight] = React.useMemo(() => {
		const fHeight = height - 28;
		const fWidth = width;
		return [fWidth, fHeight];
	}, [width, height]);

	const [innerWidth, innerHeight] = React.useMemo(() => {
		const iWidth = effectiveWidth - margin.left - margin.right;
		const iHeight = effectiveHeight - margin.top - margin.bottom;
		return [iWidth, iHeight];
	}, [effectiveWidth, effectiveHeight, margin]);

	const { origin, sizeWidth, sizeHeight } = React.useMemo(() => {
		let origin: Vector2;
		let sizeWidth: number;
		let sizeHeight: number;
		if (layout === "polar") {
			origin = {
				x: innerWidth / 2,
				y: innerHeight / 2
			};
			console.log("uh", layout, origin);

			sizeWidth = 2 * Math.PI;
			sizeHeight = Math.min(innerWidth, innerHeight) / 2;
		} else {
			if (orientation === "vertical") {
				origin = { x: margin.top, y: margin.right };
				sizeWidth = innerWidth;
				sizeHeight = innerHeight;
			} else {
				origin = { x: margin.left, y: margin.top };
				sizeWidth = innerHeight;
				sizeHeight = innerWidth;
			}
		}
		return {
			origin,
			sizeWidth,
			sizeHeight
		};
	}, [layout, innerWidth, innerHeight]);
	const innerGroupRef = React.useRef<SVGElement>(null);
	const root = React.useMemo(() => {
		return hierarchy(data, d => (d.isExpanded ? d.children : null));
	}, [JSON.stringify(data)]);

	React.useEffect(() => {
		if (!innerGroupRef.current) return;
		console.log("ref", innerGroupRef);
		const preCanvas = innerGroupRef.current.getBoundingClientRect();
		const nodeCanvas = innerGroupRef.current.children[0]; //should be 1
		const firstNode = innerGroupRef.current.children[0]
			.firstChild as SVGElement;
		const firstNodeRect = firstNode && firstNode.getBoundingClientRect();
		const canvasRect = nodeCanvas.getBoundingClientRect();
		// console.log("preCanvas", preCanvas.width, preCanvas.height)
		// console.log("canvas", canvasRect.width, canvasRect.height)
		// console.log("effectve", effectiveWidth, effectiveHeight)
		// console.log("width?", canvasRect.width===effectiveWidth, effectiveWidth-canvasRect.width)
		if (firstNodeRect) {
			if (orientation === "horizontal") {
				// console.log("will change origin", origin)
				// origin.x = margin.left-firstNodeRect.width/2
			}
			if (orientation === "vertical") {
				// console.log("will change origin", origin)
				// origin.y = margin.top-firstNodeRect.height/2
			}
		}
	}, [layout, orientation, width, height, innerGroupRef.current]);

	return (
		<div>
			<div>
				<label>layout:</label>
				<select
					onChange={e => setlayout(e.target.value)}
					value={layout}
				>
					<option value="cartesian">cartesian</option>
					<option value="polar">polar</option>
				</select>

				<label>orientation:</label>
				<select
					onChange={e => setOrientation(e.target.value)}
					value={orientation}
					disabled={layout === "polar"}
				>
					<option value="vertical">vertical</option>
					<option value="horizontal">horizontal</option>
				</select>

				<label>link:</label>
				<select
					onChange={e => setLinkType(e.target.value)}
					value={linkType}
				>
					<option value="diagonal">diagonal</option>
					<option value="step">step</option>
					<option value="curve">curve</option>
					<option value="line">line</option>
					<option value="elbow">elbow</option>
				</select>

				<label>step:</label>
				<input
					type="range"
					min={0}
					max={1}
					step={0.1}
					onChange={e => setStepPercent(Number(e.target.value))}
					value={stepPercent}
					disabled={linkType !== "step" || layout === "polar"}
				/>
			</div>

			<svg width={effectiveWidth} height={effectiveHeight}>
				<LinearGradient id="lg" from="#fd9b93" to="#fe6e9e" />
				<rect
					width={effectiveWidth}
					height={effectiveHeight}
					rx={14}
					fill="#272b4d"
				/>
				<Tree
					top={origin.y}
					left={origin.x}
					root={root}
					size={[sizeWidth, sizeHeight]}
					separation={(a: any, b: any) =>
						(a.parent == b.parent ? 1 : 0.5) / a.depth
					}
				>
					{(data: any) => {
						console.log(
							origin.y,
							origin.x,
							margin.top,
							margin.left
						);
						return (
							<Group
								top={origin.y}
								left={origin.x}

								// innerRef={innerGroupRef}
							>
								<Links
									links={data.links()}
									linkType={linkType}
									layout={layout}
									orientation={orientation}
									stepPercent={stepPercent}
								/>

								<Nodes
									nodes={data.descendants()}
									layout={layout}
									orientation={orientation}
									onNodeClick={(node: any) => {
										console.log("click node", node.data);
										if (!node.data.isExpanded) {
											node.data.x0 = node.x;
											node.data.y0 = node.y;
										}
										node.data.isExpanded = !node.data
											.isExpanded;
										console.log("click node", node.data);
										forceUpdate(!r);
									}}
								/>
							</Group>
						);
					}}
				</Tree>
			</svg>
		</div>
	);
};

export default TreeView;
