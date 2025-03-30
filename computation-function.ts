export function costlyComputeFunction(n: number, complexity: number): number {
  // Simulates a complex mathematical computation
  let result = 0;
  
  // Nested loops to make it computationally expensive
  for (let i = 0; i < complexity; i++) {
    for (let j = 0; j < n; j++) {
      result += Math.sin(j) * Math.cos(i) / (1 + Math.abs(Math.tan(i + j)));
    }
  }

  // Add some recursive calculations
  if (n > 1 && complexity > 1) {
    result += costlyComputeFunction(n - 1, complexity - 1) * 0.1;
  }

  return result;
}
