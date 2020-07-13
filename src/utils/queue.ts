export function enqueue<T>(queue: T[], itemToAdd: T): T[] {
  return [...queue, itemToAdd];
}

export function dequeue<T>(queue: T[]): [T[], T] {
  return [queue.slice(1), queue[0]];
}
