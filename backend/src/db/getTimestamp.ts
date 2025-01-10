export function getTimestamp(id: string): number {
  const parts = id.split('_');
  if (parts.length !== 2) {
    throw new Error('Invalid ID format');
  }

  const timestampBase36 = parts[1].slice(0, -6);
  const timestamp = parseInt(timestampBase36, 36);
  return timestamp;
}
