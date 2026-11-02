import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  createField,
  ModelBlock,
  type ModelNode,
} from '../model-block/ModelBlock';

const nodeTypes = { model: ModelBlock };

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
    setNodes((currentNodes) => {
      const index = currentNodes.length;
      const newNode: ModelNode = {
        id: crypto.randomUUID(),
        type: 'model',
        position: {
          x: (index % 5) * 220,
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
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
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
