/** MIME type used to identify draggable backend blocks. */
export const BLOCK_DRAG_TYPE = 'application/brume-block';

const blockTypes = [{ label: 'Model', type: 'model' }] as const;

type BlockType = (typeof blockTypes)[number]['type'];

type BlockPaletteProps = {
  onCreateBlock: (type: BlockType) => void;
};

/** A palette containing the backend blocks available to the canvas. */
export function BlockPalette({ onCreateBlock }: BlockPaletteProps) {
  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    type: BlockType,
  ) {
    event.dataTransfer.setData(BLOCK_DRAG_TYPE, type);
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
      {blockTypes.map((block) => (
        <button
          key={block.type}
          type="button"
          draggable
          onClick={() => onCreateBlock(block.type)}
          onDragStart={(event) => handleDragStart(event, block.type)}
          style={{ cursor: 'grab' }}
        >
          {block.label}
        </button>
      ))}
    </div>
  );
}
