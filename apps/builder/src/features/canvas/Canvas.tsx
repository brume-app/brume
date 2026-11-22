import {
  addEdge,
  Background,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useReactFlow,
  useNodesState,
  type XYPosition,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ModelBlock, type ModelNode } from '../model-block/ModelBlock';
import { BLOCK_DRAG_TYPE, BlockPalette } from './BlockPalette';
import { createModelNode } from './nodeFactory';
import {
  createRelationEdge,
  RelationEdge,
  type RelationEdgeModel,
} from './RelationEdge';

const nodeTypes = { model: ModelBlock };
const edgeTypes = { relation: RelationEdge };

function CanvasContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ModelNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationEdgeModel>([]);
  const { screenToFlowPosition } = useReactFlow<ModelNode>();

  function handleConnect(connection: Connection) {
    const newEdge = createRelationEdge(connection, edges);
    if (newEdge === null) {
      return;
    }

    setEdges((currentEdges) => addEdge(newEdge, currentEdges));
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function addModelNode(position: XYPosition) {
    setNodes((currentNodes) => [...currentNodes, createModelNode(position)]);
  }

  function handleCreateBlock(type: 'model') {
    if (type !== 'model') {
      return;
    }

    setNodes((currentNodes) => {
      const index = currentNodes.length;
      return [
        ...currentNodes,
        createModelNode({
          x: 80 + (index % 4) * 320,
          y: 80 + Math.floor(index / 4) * 220,
        }),
      ];
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.getData(BLOCK_DRAG_TYPE) !== 'model') {
      return;
    }

    addModelNode(screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }

  return (
    <div
      data-testid="canvas-drop-zone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ width: '100%', height: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        edgeTypes={edgeTypes}
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <BlockPalette onCreateBlock={handleCreateBlock} />
        </Panel>
      </ReactFlow>
    </div>
  );
}

/**
 * Interactive node editor built on React Flow.
 *
 * @remarks
 * The parent must give the component an explicit size: React Flow
 * fills its container and renders nothing if that container has no
 * height.
 *
 * Nodes live in local state only and are lost when the component unmounts.
 */
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
