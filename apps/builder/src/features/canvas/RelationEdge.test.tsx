import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  type Node,
} from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { createRelationEdge } from './RelationEdge';
import { RelationEdge, type RelationEdgeModel } from './RelationEdge';

const relationNodes: Node[] = [
  { id: 'model-1', type: 'default', position: { x: 0, y: 0 }, data: {} },
  { id: 'model-2', type: 'default', position: { x: 240, y: 0 }, data: {} },
];

function RelationHarness() {
  const [edges, , onEdgesChange] = useEdgesState<RelationEdgeModel>([
    {
      id: 'relation-1',
      source: 'model-1',
      target: 'model-2',
      type: 'relation',
      data: { kind: 'one-to-many' },
    },
  ]);

  return (
    <ReactFlow
      nodes={relationNodes}
      edges={edges}
      onEdgesChange={onEdgesChange}
      edgeTypes={{ relation: RelationEdge }}
    />
  );
}

describe('createRelationEdge', () => {
  it('creates a one-to-many relation from a connection', () => {
    const edge = createRelationEdge({
      source: 'model-1',
      sourceHandle: 'source',
      target: 'model-2',
      targetHandle: 'target',
    });

    expect(edge).toMatchObject({
      source: 'model-1',
      sourceHandle: 'source',
      target: 'model-2',
      targetHandle: 'target',
      type: 'relation',
      data: { kind: 'one-to-many' },
    });
    expect(edge?.id).toBeTruthy();
  });

  it('rejects self-relations', () => {
    expect(
      createRelationEdge({
        source: 'model-1',
        sourceHandle: 'source',
        target: 'model-1',
        targetHandle: 'target',
      }),
    ).toBeNull();
  });

  it('rejects a second relation in either direction', () => {
    const existingEdge = createRelationEdge({
      source: 'model-1',
      sourceHandle: 'source',
      target: 'model-2',
      targetHandle: 'target',
    });

    expect(existingEdge).not.toBeNull();
    expect(
      createRelationEdge(
        {
          source: 'model-2',
          sourceHandle: 'source',
          target: 'model-1',
          targetHandle: 'target',
        },
        existingEdge === null ? [] : [existingEdge],
      ),
    ).toBeNull();
  });

  it('updates the cardinality through the relation selector', async () => {
    const user = userEvent.setup();
    render(
      <ReactFlowProvider>
        <RelationHarness />
      </ReactFlowProvider>,
    );

    const relationType = await screen.findByRole('combobox', {
      name: 'Relation type',
    });
    await user.selectOptions(relationType, 'many-to-many');

    expect(relationType).toHaveValue('many-to-many');
  });
});
