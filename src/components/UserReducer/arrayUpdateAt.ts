function arrayUpdateAt<T>(array: T[], index: number, value: T): T[] {
  if (index === -1) return [...array, value];
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}
export default arrayUpdateAt;
