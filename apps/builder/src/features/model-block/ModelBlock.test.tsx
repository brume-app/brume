import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
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

  return render(
    <ReactFlowProvider>
      <ModelBlock {...props} />
    </ReactFlowProvider>,
  );
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

  it('prevents interactive controls from dragging the node', () => {
    renderModelBlock([
      {
        id: 'field-1',
        name: 'id',
        type: 'string',
        required: true,
        unique: false,
        defaultValue: '',
      },
    ]);

    expect(screen.getByLabelText('Field name')).toHaveClass('nodrag');
    expect(screen.getByLabelText('Field type')).toHaveClass('nodrag');
    expect(screen.getByLabelText('Field default')).toHaveClass('nodrag');
    expect(screen.getByLabelText('Required')).toHaveClass('nodrag');
    expect(screen.getByLabelText('Unique')).toHaveClass('nodrag');
    expect(screen.getByRole('button', { name: 'Remove field' })).toHaveClass(
      'nodrag',
    );
    expect(screen.getByRole('button', { name: 'Add field' })).toHaveClass(
      'nodrag',
    );
  });
});
