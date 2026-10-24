import { render, screen } from '@testing-library/react';
import type { NodeProps } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { ModelBlock, type ModelField, type ModelNode } from './ModelBlock';

function renderModelBlock(fields: ModelField[] = []) {
  const props: NodeProps<ModelNode> = {
    id: 'model-1',
    type: 'model',
    data: {
      label: 'New model',
      fields,
    },
    width: 180,
    height: 120,
    dragging: false,
    zIndex: 0,
    selectable: true,
    deletable: true,
    selected: false,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  };

  return render(<ModelBlock {...props} />);
}

describe('ModelBlock', () => {
  it('renders an empty state when the model has no fields', () => {
    renderModelBlock([]);

    expect(screen.getByText('New model')).toBeInTheDocument();
    expect(screen.getByText('No fields yet')).toBeInTheDocument();
  });

  it('renders the field names when a model has fields', () => {
    renderModelBlock([
      {
        id: 'field-1',
        name: 'id',
        type: 'string',
        required: true,
        unique: true,
        defaultValue: '',
      },
      {
        id: 'field-2',
        name: 'name',
        type: 'string',
        required: false,
        unique: false,
        defaultValue: '',
      },
    ]);

    expect(screen.getByDisplayValue('id')).toBeInTheDocument();
    expect(screen.getByDisplayValue('name')).toBeInTheDocument();
  });
});
