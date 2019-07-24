import React, { FC } from "react";
import { Group } from "@vx/group";
import { NodeGroup } from "react-move";
import Link from "./Link";
import { findCollapsedParent } from "./utils";
import { LinksProps } from "./types";

const Links: FC<LinksProps> = (props: LinksProps) => {
	const { links, linkType, layout, orientation, stepPercent } = props;

	return (
		<NodeGroup
			data={links}
			keyAccessor={(d, i) =>
				`${d.source.data.id}_${d.target.data.id}`
			}
			start={({ source, target }) => {
				return {
					source: {
						x: source.data.x0 || source.x,
						y: source.data.y0 || source.y
					},
					target: {
						x: source.data.x0 || source.x,
						y: source.data.y0 || source.y
					}
				};
			}}
			enter={({ source, target }) => {
				if (layout === "polar") {
					return {
						source: {
							x: [source.x],
							y: [source.y]
						},
						target: {
							x: [target.x],
							y: [target.y]
						}
					};
				}
				return {
					source: {
						x: [source.x],
						y: [
							orientation === "vertical"
								? source.y
								: source.y -
								  ((source.depth === 0 ? -1 : 1) *
										(source.data &&
											source.data.renderWidth / 2) || 0)
						]
					},
					target: {
						x: [target.x],
						y: [
							orientation === "vertical"
								? target.y
								: target.y -
								  ((target.depth === 0 ? -1 : 1) *
										(target.data &&
											target.data.renderWidth / 2) || 0)
						]
					}
				};
			}}
			update={({ source, target }) => {
				if (layout === "polar") {
					return {
						source: {
							x: [source.x],
							y: [source.y]
						},
						target: {
							x: [target.x],
							y: [target.y]
						}
					};
				}

				return {
					source: {
						x: [source.x],
						y: [
							orientation === "vertical"
								? source.y
								: source.y -
								  ((source.depth === 0 ? -1 : 1) *
										(source.data &&
											source.data.renderWidth / 2) || 0)
						]
					},
					target: {
						x: [target.x],
						y: [
							orientation === "vertical"
								? target.y
								: target.y -
								  ((target.depth === 0 ? -1 : 1) *
										(target.data &&
											target.data.renderWidth / 2) || 0)
						]
					}
				};
			}}
			leave={({ source, target }) => {
                const collapsedParent = findCollapsedParent(source);
                console.log("ya boi", collapsedParent)
				return {
					source: {
						x: [
							collapsedParent!.data.x0 || collapsedParent!.x
						], //assume not null because root (only parentless node, will never leave)
						y: [collapsedParent!.data.y0 || collapsedParent!.y ]
					},
					target: {
						x: [
							collapsedParent!.data.x0 || collapsedParent!.x
						],
						y: [collapsedParent!.data.y0 || collapsedParent!.y ]
					}
				};
			}}
		>
			{nodes => (
				<Group>
					{nodes.map(({ key, data, state }) => {
						return (
							<Link
								data={state}
								linkType={linkType}
								layout={layout}
								orientation={orientation}
								stepPercent={stepPercent}
								stroke="#374469"
								strokeWidth="1"
								fill="none"
								key={key}
							/>
						);
					})}
				</Group>
			)}
		</NodeGroup>
	);
};

export default Links;
