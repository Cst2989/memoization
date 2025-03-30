export function memoize(fn: (...args: any[]) => any) {
  const cache = new WeakMap();
  const primitiveCache = new Map<string | symbol, any>();
  
  return function(this: any, ...args: any[]): any {
    // For single reference type arguments, use WeakMap
    if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === 'symbol') {
        if (!primitiveCache.has(arg)) {
          const result = fn.apply(this, args);
          primitiveCache.set(arg, result);
        }
        return primitiveCache.get(arg);
      }
      if (typeof arg === 'object' || typeof arg === 'function') {
        // For non-serializable types, use reference equality
        if (arg instanceof Map || arg instanceof Set || typeof arg === 'function' || hasCircularReference(args)) {
          if (!cache.has(arg)) {
            const result = fn.apply(this, args);
            cache.set(arg, result);
          }
          return cache.get(arg);
        }
        // For regular objects, use property-based equality
        const key = generateKeyForValue(arg);
        if (!primitiveCache.has(key)) {
          const result = fn.apply(this, args);
          primitiveCache.set(key, result);
        }
        return primitiveCache.get(key);
      }
    }
    
    // For primitives or multiple arguments, use string key
    const key = generateKey(args);
    if (!primitiveCache.has(key)) {
      const result = fn.apply(this, args);
      primitiveCache.set(key, result);
    }
    return primitiveCache.get(key);
  };
}


function generateKey(args: any[]): string {
  if (args.length === 0) return '()';
  if (args.length === 1) return generateKeyForValue(args[0]);
  
  return args.map(arg => generateKeyForValue(arg)).join(',');
}




function generateKeyForValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = typeof value;
  
  switch (type) {
    case 'string':
      return `"${value}"`;
    case 'number':
    case 'boolean':
      return String(value);
    case 'symbol':
      return `Symbol(${value.description})`;
    case 'function':
      return `function:${value.name || 'anonymous'}`;
    case 'object':
      if (value instanceof Map) {
        return `Map(${Array.from(value.entries()).map(([k, v]) => 
          `${generateKeyForValue(k)}:${generateKeyForValue(v)}`).join(',')})`;
      }
      if (value instanceof Set) {
        return `Set(${Array.from(value).map(v => generateKeyForValue(v)).join(',')})`;
      }
      if (Array.isArray(value)) {
        return `[${value.map(v => generateKeyForValue(v)).join(',')}]`;
      }
      // For regular objects
      const keys = Object.keys(value).sort();
      return `{${keys.map(k => `${k}:${generateKeyForValue(value[k])}`).join(',')}}`;
    default:
      return String(value);
  }
}


function hasCircularReference(value: any, visited = new Set<any>()): boolean {
  if (value === null || typeof value !== 'object') return false;
  if (visited.has(value)) return true;
  visited.add(value);
  
  for (const key in value) {
    if (hasCircularReference(value[key], visited)) return true;
  }
  return false;
}
