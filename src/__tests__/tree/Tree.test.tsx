import { Tree } from "@vx/hierarchy";
import * as React from "react";
import ReactDOM from "react-dom";
import TreeView from "../../tree/Tree";
import data from "../../tree/data";
import {
	TreeProps,
	NodeProps,
	TreeNodeData,
	TreeNode,
	TreeOperations
} from "../../tree/types";
import { create } from "react-test-renderer";
import shortid from "shortid";
import Node from "../../tree/Node";
import { mount } from "enzyme";
import NodesMove from "../../tree/Nodes";
import { Group } from "@vx/group";
import { hierarchy } from "d3-hierarchy";
import _ from "lodash";

let testProps: TreeProps = { data: data, width: 500, height: 400 };

describe("Tree view basic", () => {
    beforeEach(()=>{
        testProps = { data: JSON.parse(JSON.stringify(data)), width: 500, height: 400 };
    })

	it("renders without crashing", () => {
		const div = document.createElement("div");
		ReactDOM.render(<TreeView {...testProps} />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

    const getTree = (props:TreeProps)=>{
        const data = props.data;
        const wrapper = mount(<TreeView {...testProps} />);
        const root = hierarchy(data, d => (d.isExpanded ? d.children : null));
        const nodes = root.descendants();
        const wrapperNodes = wrapper.find(Node);
        return {wrapper, root, nodes, wrapperNodes};
    }

	it("renders nodes with correct info", () => {
        const {wrapperNodes, nodes} = getTree(testProps);
		const renderedIds = wrapperNodes
			.map(i => i.props().node.data.id)
			.sort();
		const renderedNames = wrapperNodes.map(i => i.text()).sort();
		const names = nodes.map(i => i.data.name).sort();
		const ids = nodes.map(i => i.data.id).sort();
		expect(wrapperNodes.length).toBe(nodes.length);
		expect(ids).toEqual(renderedIds);
		expect(names).toEqual(renderedNames);
    });
    
	it("matches snapshot", () => {
        const {wrapper} = getTree(testProps);
		expect(wrapper).toMatchSnapshot();
    });
    
	it("handles click expand correctly", () => {
        const {wrapperNodes} = getTree(testProps);
		const firstNode = wrapperNodes.first();
		const firstNodeData = firstNode.props().node.data;
		expect(firstNodeData.isExpanded).toBe(true);
		firstNode.simulate("click");
		expect(firstNodeData.isExpanded).toBe(false);
	});
});

const getTree = (props: Partial<TreeProps>) => {
    const mergedProps = {
        data: {
            name: "root",
            id: "root"
        },
        width: 500,
        height: 400,
        ...props
    };
    const wrapper = mount(<TreeView {...mergedProps} />);
    const canvas = wrapper.find("#vxTree_canvas");
    const wrapperNodes = wrapper.find(Node);
    const firstNode = wrapperNodes.first();
    const firstTreeNode = firstNode.props().node;
    // const root = hierarchy(testData, d => (d.isExpanded ? d.children : null));
    return {firstNode, firstTreeNode, wrapper, canvas}
};

const assureValidOperations = (ops:any) =>{
    expect(typeof ops['addNode']).toBe('function');
    expect(typeof ops['collapseAll']).toBe('function');
    expect(typeof ops['expandAll']).toBe('function');
    expect(typeof ops['expandNode']).toBe('function');
    expect(typeof ops['removeNode']).toBe('function');
}

describe("Tree node events", () => {
	const testData: TreeNodeData = {
		name: "root",
		id: "root"
    };

    const assureValidMock = (testMock:jest.Mock, evType:string, node:TreeNode)=>{
        expect(testMock.mock.calls.length).toBe(1);
        expect(testMock.mock.calls[0].length).toBe(3)
        expect(testMock.mock.calls[0][0]['type']).toBe(evType)
        expect(testMock.mock.calls[0][1]).toMatchObject<TreeNode>(node)
        expect(typeof testMock.mock.calls[0][2]).toBe('object');
        assureValidOperations(testMock.mock.calls[0][2]);
    }

    it("node clicks ok", () => {
        const clickMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({                                                                              
            onNodeClick: clickMock,
		});
        firstNode.simulate("click");
        assureValidMock(clickMock, 'click', firstTreeNode);
    });

    it("node doubleClicks ok", () => {
        const doubleClickMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeDoubleClick: doubleClickMock,
		});
        firstNode.simulate("doubleClick");
        assureValidMock(doubleClickMock, 'doubleclick', firstTreeNode);
    });

    it("node mouseHovers ok", () => {
        const mouseHoverMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeHover: mouseHoverMock,
		});
        firstNode.simulate("mouseMove");
        assureValidMock(mouseHoverMock, 'mousemove', firstTreeNode);
    });

    it("node mouseEnters ok", () => {
        const mouseEnterMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeMouseEnter: mouseEnterMock,
		});
        firstNode.simulate("mouseEnter");
        assureValidMock(mouseEnterMock, 'mouseenter', firstTreeNode);
    });

    it("node mouseLeaves ok", () => {
        const mouseLeaveMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeMouseLeave: mouseLeaveMock,
		});
        firstNode.simulate("mouseLeave");
        assureValidMock(mouseLeaveMock, 'mouseleave', firstTreeNode);
    });

    it("node initial changes ok", () => {
        const changeNodeMock = jest.fn();
        const {firstTreeNode, wrapper } = getTree({
            onNodeChange: changeNodeMock,
		});
        expect(changeNodeMock.mock.calls.length).toBe(2);
        expect(changeNodeMock.mock.calls[0][0]).toBe('renderWidth');
        expect(changeNodeMock.mock.calls[1][0]).toBe('renderHeight');
        wrapper.setProps({data:{...firstTreeNode.data, name:'extra root'}})
        expect(changeNodeMock.mock.calls.length).toBe(4);
        expect(changeNodeMock.mock.calls.every((i)=>i.length===3)).toBe(true);
        expect(changeNodeMock.mock.calls[2][0]).toBe('renderWidth');
        expect(changeNodeMock.mock.calls[3][0]).toBe('renderHeight');
    });
});

describe("Tree upper level events", () =>{
    
    const assureValidMock = (testMock:jest.Mock, evType:string)=>{
        expect(testMock.mock.calls.length).toBe(1);
        expect(testMock.mock.calls[0].length).toBe(2)
        expect(testMock.mock.calls[0][0]['type']).toBe(evType)
        expect(typeof testMock.mock.calls[0][1]).toBe('object');
        assureValidOperations(testMock.mock.calls[0][1]);
    }

    it("canvas clicks ok", () => {
        const clickMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasClick: clickMock,
		});
        canvas.simulate("click");
        assureValidMock(clickMock, 'click');
    });

    it("canvas doubleClicks ok", () => {
        const doubleClickMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasDoubleClick: doubleClickMock,
		});
        canvas.simulate("doubleClick");
        assureValidMock(doubleClickMock, 'doubleclick');
    });

    it("canvas mouseHovers ok", () => {
        const mouseMoveMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasHover: mouseMoveMock,
		});
        canvas.simulate("mouseMove");
        assureValidMock(mouseMoveMock, 'mousemove');
    });

    it("canvas mouseEnters ok", () => {
        const mouseEnterMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasMouseEnter: mouseEnterMock,
		});
        canvas.simulate("mouseEnter");
        assureValidMock(mouseEnterMock, 'mouseenter');
    });

    it("canvas mouseLeaves ok", () => {
        const mouseLeaveMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasMouseLeave: mouseLeaveMock,
		});
        canvas.simulate("mouseLeave");
        assureValidMock(mouseLeaveMock, 'mouseleave');
    });

    it("tree changes ok (addNode->collapseAll routine)", () => {
        let operations:Partial<TreeOperations> = {};
        const changeMock = jest.fn();
        const { firstTreeNode } = getTree({                                                                              
            onOpsReady:(ops:TreeOperations)=>{operations={...ops}},
            onChange:changeMock
        });
        expect(changeMock.mock.calls.length).toBe(2);
        operations.addNode!(firstTreeNode);
        expect(changeMock.mock.calls.length).toBe(6);
        operations.collapseAll!();
        expect(changeMock.mock.calls.length).toBe(8);
        expect(changeMock.mock.calls.every((call)=>call.length===3)).toBe(true);
    });
});