import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('starts with no model blocks', () => {
    render(<Canvas />);

    expect(screen.queryByText('New model')).not.toBeInTheDocument();
  });

  it('adds a model block when activating the palette button', async () => {
    const user = userEvent.setup();
    render(<Canvas />);

    await user.click(screen.getByRole('button', { name: 'Model' }));

    expect(screen.getByText('New model')).toBeInTheDocument();
    expect(screen.getByDisplayValue('id')).toBeInTheDocument();
  });

  it('adds a model block when dropping it from the palette', () => {
    render(<Canvas />);

    fireEvent.drop(screen.getByTestId('canvas-drop-zone'), {
      clientX: 320,
      clientY: 240,
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/brume-block' ? 'model' : '',
      },
    });

    expect(screen.getAllByText('New model')).toHaveLength(1);
  });

  it('adds, edits and removes a field from a model block', async () => {
    const user = userEvent.setup();
    render(<Canvas />);

    fireEvent.drop(screen.getByTestId('canvas-drop-zone'), {
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/brume-block' ? 'model' : '',
      },
    });
    const addFieldButtons = screen.getAllByRole('button', {
      name: /add field/i,
    });
    await user.click(addFieldButtons[addFieldButtons.length - 1]);

    const newFieldInput = screen.getByDisplayValue('newField');
    expect(newFieldInput).toBeInTheDocument();

    await user.clear(newFieldInput);
    await user.type(newFieldInput, 'createdAt');
    expect(screen.getByDisplayValue('createdAt')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', {
      name: /remove field/i,
    });
    await user.click(removeButtons[removeButtons.length - 1]);
    expect(screen.queryByDisplayValue('createdAt')).not.toBeInTheDocument();
  });
});
