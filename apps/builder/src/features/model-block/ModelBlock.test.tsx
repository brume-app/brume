import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModelBlock, type ModelNode } from './ModelBlock';

describe('ModelBlock', () => {
  it('renders an empty state when the model has no fields', () => {
    const modelNode: ModelNode = {
      id: 'model-1',
      type: 'model',
      position: { x: 0, y: 0 },
      data: {
        label: 'New model',
        fields: [],
      },
    };

    render(<ModelBlock {...modelNode} />);

    expect(screen.getByText('New model')).toBeInTheDocument();
    expect(screen.getByText('No fields yet')).toBeInTheDocument();
  });
});
