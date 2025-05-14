/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';
import { computeCIs } from '@/utils/lassoUtils';

// Assuming computeCIs is typed elsewhere; using any for X, y, and computeCIs for now
interface CoefficientsBarChartProps {
  path: { lambda: number; betas: number[] }[];
  lambdaIdx: number;
  X: any; // Replace with proper type if available
  y: any; // Replace with proper type if available
}

const CoefficientsBarChart: React.FC<CoefficientsBarChartProps> = ({ path, lambdaIdx, X, y }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path || path.length === 0 || !path[0]?.betas) {
      setError('No data available to plot.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const b_lasso = path[lambdaIdx].betas;
    const { selectiveCI, naiveCI, S } = computeCIs(X, y, b_lasso, lambdaIdx, path);

    if (S.length === 0) {
      Plotly.newPlot('barChart', [], { title: 'No Features Selected' })
        .then(() => setIsLoading(false))
        .catch(() => {
          setError('Failed to render the plot.');
          setIsLoading(false);
        });
      return;
    }

    console.log('Selected Features:', S);
    console.log('Naive CI:', naiveCI);
    console.log('Selective CI:', selectiveCI);

    const data = [
      {
        x: S.map((i) => `x${i + 1}`),
        y: S.map((i) => b_lasso[i]),
        type: 'bar',
        name: 'LASSO Coefficients',
        error_y: {
          type: 'data',
          symmetric: false,
          array: S.map((_, i) => selectiveCI[i].upper - b_lasso[S[i]]),
          arrayminus: S.map((_, i) => b_lasso[S[i]] - selectiveCI[i].lower),
          color: 'blue',
        },
      },
      {
        x: S.map((i) => `x${i + 1}`),
        y: S.map((i) => b_lasso[i]),
        type: 'bar',
        opacity: 0,
        name: 'Naive CI',
        error_y: {
          type: 'data',
          symmetric: false,
          array: S.map((_, i) => naiveCI[i].upper - b_lasso[S[i]]),
          arrayminus: S.map((_, i) => b_lasso[S[i]] - naiveCI[i].lower),
          color: 'red',
        },
      },
    ];

    Plotly.newPlot('barChart', data, { title: 'Coefficients and CIs', yaxis: { title: 'Value' } })
      .then(() => setIsLoading(false))
      .catch(() => {
        setError('Failed to render the plot.');
        setIsLoading(false);
      });
  }, [path, lambdaIdx, X, y]);

  return (
    <div className="w-full h-96">
      {isLoading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      <div id="barChart" style={{ display: isLoading || error ? 'none' : 'block' }}></div>
    </div>
  );
};

export default CoefficientsBarChart;