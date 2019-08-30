import { Tree } from '@vx/hierarchy';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils'
import TreeView from '../../tree/Tree';
import data from '../../tree/data';
import {
	TreeProps,
	NodeProps,
	TreeNodeData,
	TreeNode,
	TreeOperations
} from '../../tree/types';
import shortid from 'shortid';
import Node from '../../tree/Node';
import { mount } from 'enzyme';
import NodesMove from '../../tree/Nodes';
import { Group } from '@vx/group';
import { hierarchy } from 'd3-hierarchy';
import _ from 'lodash';

let testProps: TreeProps = { data: data, width: 500, height: 400 };

describe('Tree view basic', () => {
    beforeEach(()=>{
        testProps = { data: JSON.parse(JSON.stringify(data)), width: 500, height: 400 };
    })

	it('renders without crashing', () => {
		const div = document.createElement('div');
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

	it('renders nodes with correct info', () => {
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
    
	it('matches snapshot', () => {
        const {wrapper} = getTree(testProps);
		expect(wrapper).toMatchSnapshot();
    });
    
	it('handles click expand correctly', () => {
        const {wrapperNodes} = getTree(testProps);
		const firstNode = wrapperNodes.first();
		const firstNodeData = firstNode.props().node.data;
		expect(firstNodeData.isExpanded).toBe(true);
		firstNode.simulate('click');
		expect(firstNodeData.isExpanded).toBe(false);
	});
});

const getTree = (props: Partial<TreeProps>) => {
    const mergedProps = {
        data: {
            name: 'root',
            id: 'root'
        },
        width: 500,
        height: 400,
        ...props
    };
    const wrapper = mount(<TreeView {...mergedProps} />);
    const canvas = wrapper.find('#vxTree_canvas');
    const wrapperNodes = wrapper.find(Node);
    const firstNode = wrapperNodes.first();
    const firstTreeNode = firstNode.props().node;
    // const root = hierarchy(testData, d => (d.isExpanded ? d.children : null));
    return {firstNode, firstTreeNode, wrapper, canvas,wrapperNodes}
};

const assureValidOperations = (ops:any) =>{
    expect(typeof ops['addNode']).toBe('function');
    expect(typeof ops['collapseAll']).toBe('function');
    expect(typeof ops['expandAll']).toBe('function');
    expect(typeof ops['expandNode']).toBe('function');
    expect(typeof ops['removeNode']).toBe('function');
}

describe('Tree node events', () => {
	const testData: TreeNodeData = {
		name: 'root',
		id: 'root'
    };

    const assureValidMock = (testMock:jest.Mock, evType:string, node:TreeNode)=>{
        expect(testMock.mock.calls.length).toBe(1);
        expect(testMock.mock.calls[0].length).toBe(3)
        expect(testMock.mock.calls[0][0]['type']).toBe(evType)
        expect(testMock.mock.calls[0][1]).toMatchObject<TreeNode>(node)
        expect(typeof testMock.mock.calls[0][2]).toBe('object');
        assureValidOperations(testMock.mock.calls[0][2]);
    }

    it('node clicks ok', () => {
        const clickMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({                                                                              
            onNodeClick: clickMock,
		});
        firstNode.simulate('click');
        assureValidMock(clickMock, 'click', firstTreeNode);
    });

    it('node doubleClicks ok', () => {
        const doubleClickMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeDoubleClick: doubleClickMock,
		});
        firstNode.simulate('doubleClick');
        assureValidMock(doubleClickMock, 'doubleclick', firstTreeNode);
    });

    it('node mouseHovers ok', () => {
        const mouseHoverMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeHover: mouseHoverMock,
		});
        firstNode.simulate('mouseMove');
        assureValidMock(mouseHoverMock, 'mousemove', firstTreeNode);
    });

    it('node mouseEnters ok', () => {
        const mouseEnterMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeMouseEnter: mouseEnterMock,
		});
        firstNode.simulate('mouseEnter');
        assureValidMock(mouseEnterMock, 'mouseenter', firstTreeNode);
    });

    it('node mouseLeaves ok', () => {
        const mouseLeaveMock = jest.fn();
        const { firstNode, firstTreeNode } = getTree({
            onNodeMouseLeave: mouseLeaveMock,
		});
        firstNode.simulate('mouseLeave');
        assureValidMock(mouseLeaveMock, 'mouseleave', firstTreeNode);
    });

    it('node initial changes ok', async () => {
        const changeNodeMock = jest.fn();
        const {firstTreeNode, wrapper } = getTree({
            onNodeChange: changeNodeMock,
		});
        expect(changeNodeMock.mock.calls.length).toBe(2);
        expect(changeNodeMock.mock.calls[0][0]).toBe('renderWidth');
        expect(changeNodeMock.mock.calls[1][0]).toBe('renderHeight');
        // wrapper.setProps({data:{...firstTreeNode.data, name:'extra root'}});
        act(()=>{
            wrapper.setProps({data:{...firstTreeNode.data, name:'extra root'}});
        })
        expect(changeNodeMock.mock.calls.length).toBe(4);
        expect(changeNodeMock.mock.calls.every((i)=>i.length===3)).toBe(true);
        expect(changeNodeMock.mock.calls[2][0]).toBe('renderWidth');
        expect(changeNodeMock.mock.calls[3][0]).toBe('renderHeight');
    });
});

describe('Tree upper level events', () =>{
    
    const assureValidMock = (testMock:jest.Mock, evType:string)=>{
        expect(testMock.mock.calls.length).toBe(1);
        expect(testMock.mock.calls[0].length).toBe(2)
        expect(testMock.mock.calls[0][0]['type']).toBe(evType)
        expect(typeof testMock.mock.calls[0][1]).toBe('object');
        assureValidOperations(testMock.mock.calls[0][1]);
    }

    it('canvas clicks ok', () => {
        const clickMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasClick: clickMock,
		});
        canvas.simulate('click');
        assureValidMock(clickMock, 'click');
    });

    it('canvas doubleClicks ok', () => {
        const doubleClickMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasDoubleClick: doubleClickMock,
		});
        canvas.simulate('doubleClick');
        assureValidMock(doubleClickMock, 'doubleclick');
    });

    it('canvas mouseHovers ok', () => {
        const mouseMoveMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasHover: mouseMoveMock,
		});
        canvas.simulate('mouseMove');
        assureValidMock(mouseMoveMock, 'mousemove');
    });

    it('canvas mouseEnters ok', () => {
        const mouseEnterMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasMouseEnter: mouseEnterMock,
		});
        canvas.simulate('mouseEnter');
        assureValidMock(mouseEnterMock, 'mouseenter');
    });

    it('canvas mouseLeaves ok', () => {
        const mouseLeaveMock = jest.fn();
        const { canvas } = getTree({                                                                              
            onCanvasMouseLeave: mouseLeaveMock,
		});
        canvas.simulate('mouseLeave');
        assureValidMock(mouseLeaveMock, 'mouseleave');
    });

    it('tree changes ok (addNode->collapseAll routine)', () => {
        let operations:Partial<TreeOperations> = {};
        const changeMock = jest.fn();
        const { firstTreeNode } = getTree({                                                                              
            onOpsReady:(ops:TreeOperations)=>{operations={...ops}},
            onChange:changeMock
        });
        expect(changeMock.mock.calls.length).toBe(2);
        act(()=>{
            operations.addNode!(firstTreeNode);
        })
        expect(changeMock.mock.calls.length).toBe(6);
        act(()=>{
            operations.collapseAll!();
        })
        expect(changeMock.mock.calls.length).toBe(8);
        expect(changeMock.mock.calls.every((call)=>call.length===3)).toBe(true);
    });
});

describe('Tree operations', ()=>{

    it('runs custom addNode correctly', ()=>{
        const addNodeMock = jest.fn((node:TreeNode)=>node);
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode} = getTree({
            addNode:addNodeMock,
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(addNodeMock.mock.calls.length).toBe(0);
        act(()=>{
            ops.addNode!(firstTreeNode);
        })
        expect(addNodeMock.mock.calls.length).toBe(1);
        expect(addNodeMock.mock.calls[0].length).toBe(1);
        expect(addNodeMock.mock.calls[0][0]).toMatchObject({...firstTreeNode});
    })

    it('runs default addNode correctly', ()=>{
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode, wrapper} = getTree({
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(firstTreeNode.children).toBeFalsy();
        expect(firstTreeNode.data.children).toBeFalsy();
        act(()=>{
            ops.addNode!(firstTreeNode);
        });
        expect(firstTreeNode.data.children).toBeTruthy();
        expect(firstTreeNode.data.children!.length).toBe(1);
    })

    it('runs custom expandNode correctly', ()=> {
        const expandNodeMock = jest.fn((node:TreeNode)=>node);
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode} = getTree({
            expandNode:expandNodeMock,
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(expandNodeMock.mock.calls.length).toBe(0);
        ops.expandNode!(firstTreeNode);
        expect(expandNodeMock.mock.calls.length).toBe(1);
        expect(expandNodeMock.mock.calls[0].length).toBe(1);
        expect(expandNodeMock.mock.calls[0][0]).toMatchObject({...firstTreeNode});
    })

    it('runs default expandNode correctly', ()=>{
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode, wrapper} = getTree({
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(firstTreeNode.data.isExpanded).toBeUndefined();
        act(()=>{
            ops.expandNode!(firstTreeNode);
        })
        expect(firstTreeNode.data.isExpanded).toBe(true);
        act(()=>{
            ops.expandNode!(firstTreeNode);
        })
        expect(firstTreeNode.data.isExpanded).toBe(false);
    })

    it('runs custom removeNode correctly', ()=> {
        const removeNodeMock = jest.fn((node:TreeNode)=>node||undefined);
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode} = getTree({
            removeNode:removeNodeMock,
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(removeNodeMock.mock.calls.length).toBe(0);
        ops.removeNode!(firstTreeNode);
        expect(removeNodeMock.mock.calls.length).toBe(1);
        expect(removeNodeMock.mock.calls[0].length).toBe(1);
        expect(removeNodeMock.mock.calls[0][0]).toMatchObject({...firstTreeNode});
    })

    it('runs default removeNode correctly', ()=>{
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode,wrapper, wrapperNodes} = getTree({
            data:{
                name:'Giovanni',
                id:'Team Rocket',
                isExpanded:true,
                children:[
                    {
                        id:'james',
                        name:'James'
                    },
                    {
                        id:'jessie',
                        name:'Jessie'
                    },
                    {
                        id:'meowth',
                        name:'Meowth'
                    }
                ]
            },
            onOpsReady:(opers)=>ops={...opers}
        })
        act(()=>{wrapper.update()})
        expect(firstTreeNode.children).toBeTruthy();
        expect(firstTreeNode.children!.length).toBe(3);
        const meowth = firstTreeNode.children!.find((c)=>c.data.id==='meowth')
        ops.removeNode!(meowth!);
        expect(firstTreeNode.children!.length).toBe(2);
        expect(firstTreeNode.children!.find((c)=>c.data.id==='meowth')).toBeUndefined();
    })

    it('runs custom expandAll correctly', ()=> {
        const expandAllMock = jest.fn();
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode} = getTree({
            expandAll:expandAllMock,
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(expandAllMock.mock.calls.length).toBe(0);
        ops.expandAll!();
        expect(expandAllMock.mock.calls.length).toBe(1);
        expect(expandAllMock.mock.calls[0].length).toBe(0);
    })

    it('runs default expandAll correctly', ()=>{
        let ops:Partial<TreeOperations> = {};
        const {firstTreeNode, wrapperNodes, wrapper} = getTree({
            data:{ //just keep this collapsed b
                name:'Giovanni',
                id:'Team Rocket',
                children:[
                    {
                        id:'james',
                        name:'James',
                        children:[
                            {
                                name:'Victreebel',
                                id:'victreebel'
                            },
                            {
                                name:'Hoppip',
                                id:'hoppip'
                            }
                        ]
                    },
                    {
                        id:'jessie',
                        name:'Jessie',
                        children:[
                            {
                                name:'Porygon Zero',
                                id:'porygonzero'
                            },
                            {
                                name:'Magikarp',
                                id:'magikarp'
                            }
                        ]
                    },
                    {
                        id:'meowth',
                        name:'Meowth',
                    }
                ]
            },
            onOpsReady:(opers)=>ops={...opers}
        })
        expect(firstTreeNode.children).toBeFalsy;
        expect(wrapperNodes.length).toBe(1);
        expect(firstTreeNode.data.isExpanded).toBeFalsy;
        const expandedRoot = ops.expandAll!((n)=>n.depth===0 || !n.children)
        wrapper.setProps({data:expandedRoot.data})
        const wrapperNodesUpdated = wrapper.find(Node);
        expect(firstTreeNode.data.isExpanded).toBe(true);
        expect(wrapperNodesUpdated.length).toBe(4);
        // expect(firstTreeNode.children!.length).toBe(3);
        // expect(wrapperNodes.length).toBe(4);
        // const meowth = firstTreeNode.children!.find((c)=>c.data.id==='meowth')
        // ops.removeNode!(meowth!);
        // expect(firstTreeNode.children!.length).toBe(2);
        // expect(firstTreeNode.children!.find((c)=>c.data.id==='meowth')).toBeUndefined();
    })
});