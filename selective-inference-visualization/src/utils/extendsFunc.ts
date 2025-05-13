import { Matrix } from 'ml-matrix';

/**
 * Selects specific columns from a matrix.
 *
 * @param X The original matrix
 * @param indices Array of column indices to select
 * @returns A new matrix with only the selected columns
 */
export function selectColumns(X: Matrix, indices: number[]): Matrix {
  const data = X.to2DArray().map((row) => indices.map((i) => row[i]));
  return new Matrix(data);
}

// Example usage:
// const X = new Matrix([
//   [1, 2, 3],
//   [4, 5, 6],
// ]);
// const S = [0, 2];

// const X_S = selectColumns(X, S);
// console.log(X_S.toString());
// Output:
// 1 3
// 4 6
