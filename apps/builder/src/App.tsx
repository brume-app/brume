import { Background, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export function App() {
  return (
    <ReactFlow>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
