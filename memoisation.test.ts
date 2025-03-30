import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { memoize } from './memoisation';

// Enhanced memoization function tests
describe('memoize', () => {
  let memoizedFn: any;
  let originalFn: any;

  beforeEach(() => {
    originalFn = vi.fn((x: any) => x);
    memoizedFn = memoize(originalFn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('basic functionality - should cache results for identical inputs', () => {
    memoizedFn(1, 2, 3);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(1, 2, 3);
    expect(originalFn).toHaveBeenCalledTimes(1); // Call count shouldn't increase
  });

  test('should differentiate between different arguments', () => {
    memoizedFn(1, 2);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(1, 2, 3);
    expect(originalFn).toHaveBeenCalledTimes(2); // Different arguments = new function call
  });

  test('handles object arguments with different property orders', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 }; // Same properties, different order
    
    memoizedFn(obj1);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(obj2);
    expect(originalFn).toHaveBeenCalledTimes(1); // Should recognize same object structure
  });

  test('handles Symbol arguments correctly', () => {
    const symbol1 = Symbol('test');
    const symbol2 = Symbol('test');
    
    memoizedFn(symbol1);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(symbol1);
    expect(originalFn).toHaveBeenCalledTimes(1); // Same symbol reference should use cache
    
    memoizedFn(symbol2);
    expect(originalFn).toHaveBeenCalledTimes(2); // Different symbol should NOT use cache
  });

  test('handles non-serializable types correctly', () => {
    const map1 = new Map([['a', 1], ['b', 2]]);
    const map2 = new Map([['a', 1], ['b', 2]]);
    
    memoizedFn(map1);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(map2);
    expect(originalFn).toHaveBeenCalledTimes(2); // Different Map instance
    
    memoizedFn(map1);
    expect(originalFn).toHaveBeenCalledTimes(2); // Same reference should use cache
  });

  test('handles function arguments correctly', () => {
    const fn1 = () => console.log('fn1');
    const fn2 = () => console.log('fn1');
    
    memoizedFn(fn1);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(fn1);
    expect(originalFn).toHaveBeenCalledTimes(1); // Same function reference should use cache
    
    memoizedFn(fn2);
    expect(originalFn).toHaveBeenCalledTimes(2); // Different function reference
  });

  test('handles circular references', () => {
    const circular1: { self?: any } = {};
    circular1.self = circular1;
    
    const circular2: { self?: any } = {};
    circular2.self = circular2;
    
    memoizedFn(circular1);
    expect(originalFn).toHaveBeenCalledTimes(1);
    
    memoizedFn(circular1);
    expect(originalFn).toHaveBeenCalledTimes(1); // Same reference should use cache
    
    memoizedFn(circular2);
    expect(originalFn).toHaveBeenCalledTimes(2); // Different circular object
  });

  test('preserves this context', () => {
    const obj = {
      value: 42,
      method: vi.fn(function(x: number) {
        return this.value + x;
      }),
      memoizedMethod: undefined as any
    };
    
    obj.memoizedMethod = memoize(obj.method);
    
    obj.memoizedMethod(8);
    expect(obj.method).toHaveBeenCalledTimes(1);
    
    obj.memoizedMethod(8);
    expect(obj.method).toHaveBeenCalledTimes(1); // Should use cache
  });
});
