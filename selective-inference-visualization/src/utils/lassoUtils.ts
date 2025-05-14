/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { inverse, Matrix } from 'ml-matrix';
import { normalMatrix } from './randomNormal';
import { selectColumns } from './extendsFunc';
import type { GeneratedData } from '@/types/GeneratedData';

export interface LassoPathEntry {
  lambda: number;
  betas: number[];
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
  m: number,
  betaValues: number[],
  sigma: number
): GeneratedData {
  // Generate X with n samples and m features
  const X = normalMatrix(n, m, 0, 1);
  // Initialize beta coefficients
  const beta = Array(m).fill(0);
  // Assign beta1 to the first feature
  // Assign beta2 to the second feature
  betaValues.forEach((val, i) => {
    if (i < m) beta[i] = val; // Assign provided beta values
  });
  // Generate noise
  const epsilon = normalMatrix(n, 1, 0, sigma);
  // Compute y
  const y = X.mmul(Matrix.columnVector(beta)).add(epsilon);
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
  const m = X.columns;
  const path: LassoPathEntry[] = [];
  // Initialize beta coefficients for m features
  let beta: number[] = Array(m).fill(0);

  for (const lambda of lambdaGrid) {
    let betaNew = [...beta];
    let converged = false;
    const maxIter = 1000;
    let iter = 0;

    while (!converged && iter < maxIter) {
      const betaOld = [...betaNew];
      for (let j = 0; j < m; j++) {
        // Column vector n×1
        const Xj = new Matrix(X.getColumn(j).map((value) => [value]));
        // n×1
        const Xbeta = X.mmul(Matrix.columnVector(betaNew));
        // n×1
        const XjBeta = Xj.clone().mul(betaNew[j]);
        // n×1
        const residual = y.clone().sub(Xbeta).add(XjBeta);

        // scalar
        const rho = Xj.transpose().mmul(residual).get(0, 0) / n;
        // scalar
        const z = Xj.transpose().mmul(Xj).get(0, 0) / n;

        if (z !== 0) {
          betaNew[j] = softThreshold(rho, lambda / n) / z;
        }
      }
      converged =
        Math.max(...betaNew.map((b, i) => Math.abs(b - betaOld[i]))) < 1e-5;
      iter++;
    }

    beta = betaNew;
    // Store beta for all m features
    path.push({ lambda, betas: [...beta] });
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
  const m = X.columns;
  const S: number[] = b_lasso
    .map((b, i) => (b !== 0 ? i : -1))
    .filter((i) => i >= 0);

  const XtX = new Matrix(X.transpose().mmul(X).div(n));
  const M = inverse(XtX);
  const b_ols_full = M.mmul(X.transpose().mmul(y)).div(n).to1DArray();
  const residuals = y.sub(X.mmul(Matrix.columnVector(b_ols_full)));
  const sigma2_ols = (residuals.norm('frobenius') ** 2) / (n - m);
  const se = M.diag().map((d) => Math.sqrt((sigma2_ols * d) / n));

  const selectiveCI: ConfidenceInterval[] = S.map((j) => ({
    lower: b_ols_full[j] - 1.96 * se[j],
    upper: b_ols_full[j] + 1.96 * se[j],
  }));

  let naiveCI: ConfidenceInterval[] = [];
  if (S.length > 0) {
    const X_S = selectColumns(X, S);
    const XtX_S = X_S.transpose().mmul(X_S);
    const M_S = inverse(XtX_S);
    const b_ols_S = M_S.mmul(X_S.transpose().mmul(y)).to1DArray();
    const residuals_S = y.sub(X_S.mmul(Matrix.columnVector(b_ols_S)));
    const sigma2_S = (residuals_S.norm('frobenius') ** 2) / (n - S.length);
    const se_S = M_S.diag().map((d: number) => Math.sqrt(sigma2_S * d));

    naiveCI = S.map((j, idx) => ({
      lower: b_ols_S[idx] - 1.96 * se_S[idx],
      upper: b_ols_S[idx] + 1.96 * se_S[idx],
    }));
  }

  return { selectiveCI, naiveCI, S };
}