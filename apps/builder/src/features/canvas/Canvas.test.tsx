import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('starts with no nodes', () => {
    render(<Canvas />);

    expect(screen.queryByText(/new model/i)).not.toBeInTheDocument();
  });

  it('adds a model block when clicking the add button', async () => {
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
});
