import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import type { RelationKind } from '@brume/shared';
import type { ModelNode } from '../model-block/ModelBlock';

export type RelationEdgeData = {
  kind: RelationKind;
};

export type RelationEdgeModel = Edge<RelationEdgeData, 'relation'>;

/** Creates a default relation edge from a valid React Flow connection. */
export function createRelationEdge(
  connection: Connection,
): RelationEdgeModel | null {
  if (connection.source === connection.target) {
    return null;
  }

  return {
    ...connection,
    id: crypto.randomUUID(),
    type: 'relation',
    data: { kind: 'one-to-many' },
  };
}

const relationOptions: Array<{ label: string; value: RelationKind }> = [
  { label: '1 - 1', value: 'one-to-one' },
  { label: '1 - N', value: 'one-to-many' },
  { label: 'N - N', value: 'many-to-many' },
];

/** Renders a relation with an editable cardinality selector. */
export function RelationEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
}: EdgeProps<RelationEdgeModel>) {
  const { setEdges } = useReactFlow<ModelNode, RelationEdgeModel>();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  function handleKindChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const kind = event.target.value as RelationKind;
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, kind } } : edge,
      ),
    );
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <select
            aria-label="Relation type"
            className="nodrag nopan"
            value={data?.kind ?? 'one-to-many'}
            onChange={handleKindChange}
          >
            {relationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
