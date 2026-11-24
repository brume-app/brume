import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Canvas, canCreateConnection } from './Canvas';

describe('Canvas', () => {
  it('refuses connections to the same block', () => {
    expect(
      canCreateConnection(
        {
          source: 'model-1',
          target: 'model-1',
          sourceHandle: null,
          targetHandle: null,
        },
        [],
      ),
    ).toBe(false);
  });

  it('refuses duplicate connections', () => {
    const connection = {
      source: 'model-1',
      target: 'model-2',
      sourceHandle: null,
      targetHandle: null,
    };

    expect(
      canCreateConnection(connection, [
        {
          id: 'edge-1',
          ...connection,
        },
      ]),
    ).toBe(false);
  });

  it('starts with no nodes', () => {
    render(<Canvas />);

    expect(screen.queryByText(/new model/i)).not.toBeInTheDocument();
  });

  it('adds a model block from the blocks panel', async () => {
    const user = userEvent.setup();
    render(<Canvas />);

    await user.click(screen.getByRole('button', { name: /add node/i }));

    expect(screen.getByText('New model')).toBeInTheDocument();
    expect(screen.getByDisplayValue('id')).toBeInTheDocument();
    expect(screen.getByDisplayValue('name')).toBeInTheDocument();
  });

  it('adds a new model block on each click', async () => {
    const user = userEvent.setup();
    render(<Canvas />);
    const addButton = screen.getByRole('button', { name: /add node/i });

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getAllByText('New model')).toHaveLength(3);
  });

  it('deletes a selected model block with its node delete button', async () => {
    const user = userEvent.setup();
    render(<Canvas />);

    await user.click(screen.getByRole('button', { name: /add node/i }));
    fireEvent.click(screen.getByText('New model'));

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeEnabled();

    await user.click(deleteButton);
    expect(screen.queryByText('New model')).not.toBeInTheDocument();
  });

  it('adds, edits and removes a field from a model block', async () => {
    const user = userEvent.setup();
    render(<Canvas />);

    await user.click(screen.getByRole('button', { name: /add node/i }));
    await user.click(screen.getByRole('button', { name: /add field/i }));

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
