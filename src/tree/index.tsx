import { TreeProps } from "./types";
import React, { FC } from "react";
import Tree from "./Tree";
import data from "./data";
export { default as ScaledTree } from "./ScaledTree";

const DefaultView: FC = (props) => {
	return <Tree data={data} width={600} height={500} />;
};

export default DefaultView;
