import { Tree } from "@vx/hierarchy";
import React, { FC } from "react";
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

describe("Tree view basic", () => {
	const testProps: TreeProps = { data: data, width: 500, height: 400 };

	it("renders without crashing", () => {
		const div = document.createElement("div");
		ReactDOM.render(<TreeView {...testProps} />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	const wrapper = mount(<TreeView {...testProps} />);
	const root = hierarchy(data, d => (d.isExpanded ? d.children : null));
	const nodes = root.descendants();
	const wrapperNodes = wrapper.find(Node);

	it("renders nodes with correct info", () => {
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
		expect(wrapper).toMatchSnapshot();
	});
	it("handles click expand correctly", () => {
		const firstNode = wrapperNodes.first();
		const firstNodeData = firstNode.props().node.data;
		expect(firstNodeData.isExpanded).toBe(true);
		firstNode.simulate("click");
		expect(firstNodeData.isExpanded).toBe(false);
	});
});

describe("Tree operations and events", () => {
	const testData: TreeNodeData = {
		name: "root",
		id: "root"
    };
    const hoverEvent = jest.fn();
    const changeEvent = jest.fn();
    const mouseEnterEvent = jest.fn();
    const canvasHoverEvent = jest.fn();
    const canvasMouseEnterEvent = jest.fn();
    const canvasMouseLeaveEvent = jest.fn();
    const highChangeEvent = jest.fn();

	const testProps: TreeProps = {
		data: testData,
		width: 500,
		height: 400,
		onNodeClick: (
			event: any,
			node: TreeNode,
			operations: TreeOperations | undefined
		) => {
			operations && operations.addNode && operations.addNode(node);
        },
        onNodeDoubleClick:(
			event: any,
			node: TreeNode,
			operations: TreeOperations | undefined
		) => {
			operations && operations.expandNode && operations.expandNode(node);
        },
        onNodeHover:hoverEvent,
        onNodeChange:changeEvent,
        onNodeMouseEnter:mouseEnterEvent,
        onNodeMouseLeave:(
			event: any,
			node: TreeNode,
			operations: TreeOperations | undefined
		) => {
			operations && operations.removeNode && operations.removeNode(node);
        },
        onCanvasClick:(
			event: any,
			operations: TreeOperations | undefined
		) => {
			operations && operations.expandAll && operations.expandAll;
        },
        onCanvasDoubleClick:(
			event: any,
			operations: TreeOperations | undefined
		) => {
			operations && operations.collapseAll && operations.collapseAll;
        },
        onCanvasHover:canvasHoverEvent,
        onCanvasMouseEnter:canvasMouseEnterEvent,
        onCanvasMouseLeave:canvasMouseLeaveEvent,
        onChange:highChangeEvent
	};
	const wrapper = mount(<TreeView {...testProps} />);
	const wrapperNodes = wrapper.find(Node);
	const firstNode = wrapperNodes.first();
	const firstTreeNode = firstNode.props().node;
    const root = hierarchy(testData, d => (d.isExpanded ? d.children : null));
    let changeCalls = 0;
    let highChangeCalls = 0;
    const checkChangeCalls = ()=>{
        // expect(changeEvent.mock.calls.length).toBeGreaterThan(changeCalls);
        expect(highChangeEvent.mock.calls.length).toBeGreaterThan(highChangeCalls);
        // changeCalls=changeEvent.mock.calls.length;
        highChangeCalls=highChangeEvent.mock.calls.length;
    }
	it("handling click event and add operation as expected", () => {
        firstNode.simulate("click");
        expect(firstTreeNode.data.children).toBeTruthy();
        expect(firstTreeNode.data.children!.length).toBe(1);
        checkChangeCalls();
    });
    it("assures node is expanded after giving birth", ()=>{
        expect(firstTreeNode.data.isExpanded).toBe(true);
    })
    it("handling doubleclick event expand operation as expected", () => {
        firstNode.simulate("doubleClick");
        expect(firstTreeNode.data.isExpanded).toBe(false);
        checkChangeCalls();
    });
    it("handling hover event as expected",()=>{
        const initial = hoverEvent.mock.calls.length;
        expect(initial).toBe(0);
        firstNode.simulate("mouseMove");
        expect(hoverEvent.mock.calls.length).toBe(1)
    });
});
