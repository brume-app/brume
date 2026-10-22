import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  useNodesState,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ModelBlock, type ModelNodeData } from '../model-block/ModelBlock';

export type ModelNode = Node<ModelNodeData, 'model'>;

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
  const [nodes, setNodes, onNodesChange] = useNodesState<ModelNode>([]);

  function addNode() {
    const newNode: ModelNode = {
      id: crypto.randomUUID(),
      type: 'model',
      position: { x: 0, y: 0 },
      data: {
        label: 'New model',
        fields: ['id', 'name'],
      },
    };
    setNodes((currentNodes) => [...currentNodes, newNode]);
  }

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      nodeTypes={{ model: ModelBlock }}
    >
      <Background />
      <Controls />
      <Panel position="top-left">
        <button type="button" onClick={addNode}>
          Add Node
        </button>
      </Panel>
    </ReactFlow>
  );
}
