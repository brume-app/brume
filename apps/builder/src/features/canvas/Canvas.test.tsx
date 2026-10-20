import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('starts with no nodes', () => {
    render(<Canvas />);

    expect(screen.queryByText('New node')).not.toBeInTheDocument();
  });

  it('adds a node when clicking the add button', async () => {
    const user = userEvent.setup();
    render(<Canvas />);

    await user.click(screen.getByRole('button', { name: /add node/i }));

    expect(screen.getByText('New node')).toBeInTheDocument();
  });

  it('adds a new node on each click', async () => {
    const user = userEvent.setup();
    render(<Canvas />);
    const addButton = screen.getByRole('button', { name: /add node/i });

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getAllByText('New node')).toHaveLength(3);
  });
});
