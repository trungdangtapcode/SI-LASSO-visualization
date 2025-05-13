import { Matrix } from 'ml-matrix';

/**
 * Generates a standard normally distributed random number (mean 0, std 1)
 */
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Avoid log(0)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Creates a matrix of normally distributed random values.
 * 
 * @param rows Number of rows in the matrix
 * @param cols Number of columns in the matrix
 * @param mean Mean of the normal distribution (default = 0)
 * @param std Standard deviation of the distribution (default = 1)
 * @returns Matrix object from ml-matrix
 */
export function normalMatrix(
  rows: number,
  cols: number,
  mean: number = 0,
  std: number = 1
): Matrix {
  const data: number[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => mean + std * randn())
  );
  return new Matrix(data);
}

// Example usage
// const mat = normalMatrix(3, 3, 0, 1);
// console.log(mat.toString());