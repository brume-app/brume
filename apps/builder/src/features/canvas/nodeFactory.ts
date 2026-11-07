import type { XYPosition } from '@xyflow/react';
import { createField, type ModelNode } from '../model-block/ModelBlock';

/** Creates an editable model node at a canvas position. */
export function createModelNode(position: XYPosition): ModelNode {
  return {
    id: crypto.randomUUID(),
    type: 'model',
    position,
    data: {
      label: 'New model',
      fields: [
        createField({ name: 'id', required: true, unique: true }),
        createField({ name: 'name' }),
      ],
    },
  };
}
