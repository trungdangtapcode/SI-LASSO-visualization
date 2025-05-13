/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { inverse, Matrix } from 'ml-matrix';
import { normalMatrix }  from './randomNormal';
import { selectColumns } from './extendsFunc';
import type { GeneratedData } from '@/types/GeneratedData';
// @ts-nocheck

export interface LassoPathEntry {
  lambda: number;
  beta1: number;
  beta2: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface ComputeCIsResult {
  selectiveCI: ConfidenceInterval[];
  naiveCI: ConfidenceInterval[];
  S: number[];
}

// Generate synthetic data
export function generateData(
  n: number,
  beta1: number,
  beta2: number,
  sigma: number
): GeneratedData {
  // const X = Matrix.randn(n, 2);
  const X = normalMatrix(n, 2, 0, 1); // Use normalMatrix to generate X
  // const epsilon = Matrix.randn(n, 1).mul(sigma);
  const epsilon = normalMatrix(n, 1, 0, sigma); // Use normalMatrix to generate epsilon
  const y = X.mmul(Matrix.columnVector([beta1, beta2])).add(epsilon);
  return { X, y };
}

// Soft thresholding function for LASSO
function softThreshold(z: number, gamma: number): number {
  return Math.sign(z) * Math.max(Math.abs(z) - gamma, 0);
}

// Compute LASSO path using coordinate descent
export function computeLassoPath(
  X: Matrix,
  y: Matrix,
  lambdaGrid: number[]
): LassoPathEntry[] {
  const n = X.rows;
  const path: LassoPathEntry[] = [];
  let beta: number[] = [0, 0];

  for (const lambda of lambdaGrid) {
    let betaNew = [...beta];
    let converged = false;
    const maxIter = 1000;
    let iter = 0;

    while (!converged && iter < maxIter) {
      const betaOld = [...betaNew];
      for (let j = 0; j < 2; j++) {
        const Xj = new Matrix(X.getColumn(j).map((value) => [value]));
        const residual = y.sub(X.mmul(Matrix.columnVector(betaNew))).add(
          Xj.mul(-betaNew[j])
        );
        const rho =
          Xj.transpose().mmul(residual).get(0, 0) / n;
        const z = (Xj.norm('frobenius') ** 2) / n;
        betaNew[j] = softThreshold(rho, lambda / n) / z;
      }
      converged =
        Math.max(...betaNew.map((b, i) => Math.abs(b - betaOld[i]))) < 1e-5;
      iter++;
    }

    beta = betaNew;
    path.push({ lambda, beta1: beta[0], beta2: beta[1] });
  }

  return path;
}

// Compute confidence intervals
export function computeCIs(
  X: Matrix,
  y: Matrix,
  b_lasso: number[],
  lambdaIdx: number,
  path: LassoPathEntry[]
): ComputeCIsResult {
  const n = X.rows;
  const p = 2;
  const S: number[] = b_lasso
    .map((b, i) => (b !== 0 ? i : -1))
    .filter((i) => i >= 0);

  const XtX = new Matrix(X.transpose().mmul(X).div(n));
  const M = inverse(XtX);
  const b_ols_full = M.mmul(X.transpose().mmul(y)).div(n).to1DArray();
  const residuals = y.sub(X.mmul(Matrix.columnVector(b_ols_full)));
  const sigma2_ols = (residuals.norm('frobenius') ** 2) / (n - p);
  const se = M.diag().map((d) => Math.sqrt((sigma2_ols * d) / n));

  const selectiveCI: ConfidenceInterval[] = S.map((j) => ({
    lower: b_ols_full[j] - 1.96 * se[j],
    upper: b_ols_full[j] + 1.96 * se[j],
  }));

  let naiveCI: ConfidenceInterval[] = [];
  if (S.length > 0) {
    // const X_S = X.columnSelection(S);
    const X_S = selectColumns(X, S);
    const XtX_S = X_S.transpose().mmul(X_S);
    const b_ols_S = inverse(XtX_S).mmul(X_S.transpose().mmul(y)).to1DArray();
    const residuals_S = y.sub(X_S.mmul(Matrix.columnVector(b_ols_S)));
    const sigma2_S = (residuals_S.norm('frobenius') ** 2) / (n - S.length);
    const se_S = inverse(XtX_S)
      .diag()
      .map((d: number) => Math.sqrt(sigma2_S * d));

    naiveCI = S.map((j, idx) => ({
      lower: b_ols_S[idx] - 1.96 * se_S[idx],
      upper: b_ols_S[idx] + 1.96 * se_S[idx],
    }));
  }

  return { selectiveCI, naiveCI, S };
}