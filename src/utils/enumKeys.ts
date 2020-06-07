const isNumber = (x: string | number): x is number => !isNaN(+x);
const onlyNumbersReducer = (nums: number[], x: string | number): number[] =>
  isNumber(x) ? [...nums, x] : nums;

/**
 * Helper function to map with a TypeScript enum
 * This returns an array of numbers (e.g. [0,1,2,...])
 * corresponding to the enum, so you can create arrays that the enum can index.
 * @param keys TypeScript enum
 */
export const enumKeys = (keys: {}): number[] =>
  Object.keys(keys).reduce(onlyNumbersReducer, []);
