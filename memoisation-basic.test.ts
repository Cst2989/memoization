import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { memoize } from './memoisation-basic';
import { costlyComputeFunction } from './computation-function';

describe('memoize basic', () => {
  let memoizedFn: any;
  let originalFn: (n: number, complexity: number) => number;

  beforeEach(() => {
    originalFn = vi.fn(costlyComputeFunction);
    memoizedFn = memoize(originalFn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('basic functionality - should cache results for identical inputs', () => {
    memoizedFn(5, 3);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(5, 3);
    expect(originalFn).toHaveBeenCalledTimes(1); 
  });

  test('should handle different arguments', () => {
    memoizedFn(3, 2);
    expect(originalFn).toHaveBeenCalledTimes(1);

    memoizedFn(4, 2);
    expect(originalFn).toHaveBeenCalledTimes(2);
  });
});
