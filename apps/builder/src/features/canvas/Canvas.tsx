import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  createField,
  ModelBlock,
  type ModelNode,
} from '../model-block/ModelBlock';

const nodeTypes = { model: ModelBlock };

/**
 * Determines whether a connection can be created between two nodes.
 *
 * @remarks
 * Connections are not allowed if the source and target are the same node,
 * or if a connection already exists between the two nodes with the same
 * source and target handles.
 */
export function canCreateConnection(
  connection: Connection | Edge,
  existingEdges: Edge[],
): boolean {
  if (connection.source === connection.target) {
    return false;
  }

  return !existingEdges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      (edge.sourceHandle ?? null) === (connection.sourceHandle ?? null) &&
      (edge.targetHandle ?? null) === (connection.targetHandle ?? null),
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
 * Nodes and edges live in local state only and are lost when the component
 * unmounts.
 */
export function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ModelNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  function onConnect(connection: Connection) {
    setEdges((currentEdges) =>
      canCreateConnection(connection, currentEdges)
        ? addEdge(connection, currentEdges)
        : currentEdges,
    );
  }

  function addNode() {
    setNodes((currentNodes) => {
      const index = currentNodes.length;
      const newNode: ModelNode = {
        id: crypto.randomUUID(),
        type: 'model',
        position: {
          x: 240 + (index % 5) * 220,
          y: Math.floor(index / 5) * 150,
        },
        data: {
          label: 'New model',
          fields: [
            createField({ name: 'id', required: true, unique: true }),
            createField({ name: 'name' }),
          ],
        },
      };

      return [...currentNodes, newNode];
    });
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      isValidConnection={(connection) => canCreateConnection(connection, edges)}
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
      <Panel
        position="top-left"
        style={{
          top: 0,
          left: 0,
          bottom: 0,
          width: '200px',
          margin: 0,
          padding: '16px',
          boxSizing: 'border-box',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'stretch',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Nodes</h2>
        <button type="button" onClick={addNode}>
          Add Node
        </button>
      </Panel>
    </ReactFlow>
  );
}
