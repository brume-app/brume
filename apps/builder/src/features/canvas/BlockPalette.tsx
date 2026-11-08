/** MIME type used to identify draggable backend blocks. */
export const BLOCK_DRAG_TYPE = 'application/brume-block';

/** A palette containing the backend blocks available to the canvas. */
export function BlockPalette() {
  function handleDragStart(event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData(BLOCK_DRAG_TYPE, 'model');
    event.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '8px',
        padding: '10px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
      }}
    >
      <strong style={{ color: '#0f172a', fontSize: '12px' }}>
        Backend blocks
      </strong>
      <button
        type="button"
        draggable
        onDragStart={handleDragStart}
        style={{ cursor: 'grab' }}
      >
        Model
      </button>
    </div>
  );
}
