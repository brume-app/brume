import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  useNodesState,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  function addNode() {
    const newNode: Node = {
      id: crypto.randomUUID(),
      position: { x: 0, y: 0 },
      data: { label: 'New node' },
    };
    setNodes((currentNodes) => [...currentNodes, newNode]);
  }

  return (
    <ReactFlow nodes={nodes} onNodesChange={onNodesChange}>
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
