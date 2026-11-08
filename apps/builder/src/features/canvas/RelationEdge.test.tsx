import { describe, expect, it } from 'vitest';
import { createRelationEdge } from './RelationEdge';

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
});
