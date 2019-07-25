import * as React from "react";
import { withStyles, createStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Measure from "react-measure";
import Tree from './Tree';
import data from "./data";
import { TreeNode, TreeProps } from "./types";

const styles = createStyles({
	rootDiv: {
		backgroundColor: "cyan",
		height: "800px",
		width: "800px",
        alignItems: "center",
        resize:"both",
        overflow:"auto",
        margin:"24px"
	}
});

interface ScaledTreeProps extends TreeProps{
    classes:any
}
const ScaledTree: React.FC<ScaledTreeProps> = (props:ScaledTreeProps) => {
    const [width, setWidth] = React.useState<number>(0);
    const [height, setHeight] = React.useState<number>(0);

	return (
		<Measure bounds onResize={rect=>{
            if(rect.bounds){
                setWidth(rect.bounds.width);
                setHeight(rect.bounds.height);
            }
        }}>
			{({ measureRef }) => (
				<div ref={measureRef} className={props.classes.rootDiv}>
                    <Tree {...props as TreeProps}  width={width-20} height={height-20}/>
				</div>
			)}
		</Measure>
	);
};

export default withStyles(styles)(ScaledTree);
