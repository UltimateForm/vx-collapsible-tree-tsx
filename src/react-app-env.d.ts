/// <reference types="react-scripts" />
declare module "@vx/group" {
	import React, { SVGAttributes } from "react";

	interface GroupProps extends SVGAttributes<SVGGElement> {
		top?: number;
		left?: number;
		[prop: string]: any; // ...restProps
	}

	const Group: React.FunctionComponent<GroupProps>;
}
declare module "@vx/hierarchy" {
	import { TreemapLayout, HierarchyNode } from "d3-hierarchy";
	import React from "react";

	// dependencies
	/*
    "@vx/group": "0.0.183",
      "classnames": "^2.2.5",
      "d3-hierarchy": "^1.1.4",
      "prop-types": "^15.6.1"
    */

	type NumberOrNumberAccessor = number | Accessor<any, number>;

	interface INode {
		children?: INode[];
		data: any;
		depth: number;
		height: 1;
		parent?: INode;
		value: number;
		x?: number;
		x0?: number;
		x1?: number;
		y?: number;
		y0?: number;
		y1?: number;
	}

	interface ISharedProps {
		children: any; // React.ReactElement;
		className?: string;
		left?: number;
		nodeComponent?: any;
		root: HierarchyNode<any>;
		size?: number[];
		top?: number;
	}

	interface IClusterProps extends ISharedProps {
		linkComponent?: any;
		nodeSize?: number[];
		separation?: NumberOrNumberAccessor;
	}

	interface IHierarchyDefaultLinkProps {
		link: any;
	}

	interface IHierarchyDefaultNodeProps {
		node: INode;
	}

	interface IPackProps extends ISharedProps {
		padding?: number;
		radius?: any;
	}

	interface IPartitionProps extends ISharedProps {
		padding?: number;
		round: bool;
	}

	interface ITreeProps extends ISharedProps {
		linkComponent?: any;
		nodeComponent?: any;
		nodeSize?: number;
		separation?: NumberOrNumberAccessor;
	}

	interface ITreemapProps extends ISharedProps {
		children: React.ReactNode<HierarchyNode<any>>;
		padding?: number;
		paddingBottom?: number;
		paddingInner?: number;
		paddingLeft?: number;
		paddingOuter?: number;
		paddingRight?: number;
		paddingTop?: number;
		round: boolean;
		tile?: any;
	}

	const Cluster: React.ComponentType<IClusterProps>;

	const HierarchyDefaultLink: React.ComponentType<IHierarchyDefaultLinkProps>;

	const HierarchyDefaultNode: React.ComponentType<IHierarchyDefaultNodeProps>;

	const Pack: React.ComponentType<IPackProps>;

	const Partition: React.ComponentType<IPartitionProps>;

	const Tree: React.ComponentType<ITreeProps>;

	const Treemap: React.ComponentType<ITreemapProps>;
}
declare module "@vx/gradient" {
	interface SharedProps {
		from?: string;
		fromOffset?: string;
		fromOpacity?: number;
		id: string;
		rotate?: string | number;
		to?: string;
		toOffset?: string;
		toOpacity?: number;
		transform?: string;
	}

	interface LinearGradientProps extends SharedProps {
		vertical?: boolean;
		x1?: string;
		y1?: string;
		y2?: string;
	}

	type GradientProps = Pick<
		LinearGradientProps,
		| "id"
		| "x1"
		| "y1"
		| "y2"
		| "fromOffset"
		| "fromOpacity"
		| "toOffset"
		| "toOpacity"
		| "rotate"
		| "transform"
		| "vertical"
	>;

	interface RadialGradientProps extends SharedProps {
		r: string | number;
	}

	const LinearGradient: React.ComponentType<LinearGradientProps>;
	const RadialGradient: React.ComponentType<RadialGradientProps>;

	const GradientDarkgreenGreen: React.ComponentType<GradientProps>;
	const GradientLightgreenGreen: React.ComponentType<GradientProps>;
	const GradientOrangeRed: React.ComponentType<GradientProps>;
	const GradientPinkBlue: React.ComponentType<GradientProps>;
	const GradientPinkRed: React.ComponentType<GradientProps>;
	const GradientPurpleOrange: React.ComponentType<GradientProps>;
	const GradientPurpleRed: React.ComponentType<GradientProps>;
	const GradientPurpleTeal: React.ComponentType<GradientProps>;
	const GradientSteelPurple: React.ComponentType<GradientProps>;
	const GradientTealBlue: React.ComponentType<GradientProps>;
};

