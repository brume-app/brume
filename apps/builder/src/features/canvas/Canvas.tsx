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
function CanvasContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ModelNode>([
    createModelNode({ x: 80, y: 80 }),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationEdgeModel>([]);
  const { screenToFlowPosition } = useReactFlow<ModelNode>();

  function handleConnect(connection: Connection) {
    const newEdge = createRelationEdge(connection);
    if (newEdge === null) {
      return;
    }

    setEdges((currentEdges) => addEdge(newEdge, currentEdges));
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.getData(BLOCK_DRAG_TYPE) !== 'model') {
      return;
    }

    setNodes((currentNodes) => [
      ...currentNodes,
      createModelNode(
        screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      ),
    ]);
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
          <BlockPalette />
        </Panel>
      </ReactFlow>
    </div>
  );
}

/** Interactive node editor built on React Flow. */
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
