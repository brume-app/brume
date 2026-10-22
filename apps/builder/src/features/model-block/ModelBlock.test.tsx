import { render, screen } from '@testing-library/react';
import type { NodeProps } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { ModelBlock, type ModelNode } from './ModelBlock';

describe('ModelBlock', () => {
  it('renders an empty state when the model has no fields', () => {
    const props: NodeProps<ModelNode> = {
      id: 'model-1',
      type: 'model',
      data: {
        label: 'New model',
        fields: [],
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

    render(<ModelBlock {...props} />);

    expect(screen.getByText('New model')).toBeInTheDocument();
    expect(screen.getByText('No fields yet')).toBeInTheDocument();
  });
});
