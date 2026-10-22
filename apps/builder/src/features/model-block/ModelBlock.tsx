import type { Node, NodeProps } from '@xyflow/react';

export type ModelNodeData = {
  label: string;
  fields: string[];
};

export type ModelNode = Node<ModelNodeData, 'model'>;

/**
 * Visual placeholder for a model in the canvas.
 *
 * @remarks
 * This is the mockup that aligns the builder UI with the generator contract.
 * The node title is the model name and the field list shows the expected schema.
 */
export function ModelBlock({ data }: NodeProps<ModelNode>) {
  return (
    <div
      style={{
        minWidth: '180px',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        background: '#ffffff',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 12px',
          fontWeight: 700,
          color: '#0f172a',
        }}
      >
        {data.label}
      </div>

      <ul
        style={{
          margin: 0,
          padding: '8px 12px 12px',
          listStyle: 'none',
          color: '#334155',
        }}
      >
        {data.fields.length === 0 ? (
          <li style={{ color: '#64748b' }}>No fields yet</li>
        ) : (
          data.fields.map((field) => (
            <li key={field} style={{ padding: '2px 0' }}>
              {field}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
