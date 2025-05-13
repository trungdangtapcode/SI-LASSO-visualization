/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';
import { computeCIs } from '../utils/lassoUtils';

interface CoefficientsBarChartProps {
  path: any;
  lambdaIdx: number;
  X: any;
  y: any;
}

const CoefficientsBarChart: React.FC<CoefficientsBarChartProps> = ({ path, lambdaIdx, X, y }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const b_lasso = [path[lambdaIdx].beta1, path[lambdaIdx].beta2];
    const { selectiveCI, naiveCI, S } = computeCIs(X, y, b_lasso, lambdaIdx, path);
    if (S.length === 0) {
      Plotly.newPlot('barChart', [], { title: 'No Features Selected' }).then(() => setIsLoading(false));
      return;
    }

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
    Plotly.newPlot('barChart', data, { title: 'Coefficients and CIs', yaxis: { title: 'Value' } }).then(() => setIsLoading(false));
  }, [path, lambdaIdx, X, y]);

  return (
    <div className="w-full h-96">
      {isLoading && <div className="loading-spinner">Loading...</div>}
      <div id="barChart" style={{ display: isLoading ? 'none' : 'block' }}></div>
    </div>
  );
};

export default CoefficientsBarChart;