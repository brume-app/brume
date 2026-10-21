export function formatNodeLabel(index: number): string {
  return `Node ${padIndex(index)}`;
}

function padIndex(index: number): string {
  return String(index).padStart(2, '0');
}
