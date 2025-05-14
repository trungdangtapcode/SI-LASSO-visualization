import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';

// Define a custom type for Plotly traces to include mode and line
type PlotlyTrace = {
  x: number[];
  y: number[];
  name: string;
  type: string;
  mode?: string;
  line?: { dash?: string };
};

interface SolutionPathPlotProps {
  path: { lambda: number; betas: number[] }[];
  lambdaIdx: number;
}

const SolutionPathPlot: React.FC<SolutionPathPlotProps> = ({ path, lambdaIdx }) => {
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

    // Dynamically create traces for each beta coefficient
    const data: PlotlyTrace[] = path[0].betas.map((_, index) => ({
      x: path.map((p) => p.lambda),
      y: path.map((p) => p.betas[index]),
      name: `Beta${index + 1}`,
      type: 'scatter',
    }));

    // Add trace for selected lambda
    data.push({
      x: [path[lambdaIdx].lambda, path[lambdaIdx].lambda],
      y: [-2, 2], // Fixed range for visualization
      mode: 'lines',
      name: 'Selected Lambda',
      type: 'scatter',
      line: { dash: 'dash' },
    });

    Plotly.newPlot('solutionPlot', data, {
      title: 'LASSO Solution Path',
      xaxis: { title: 'Lambda' },
      yaxis: { title: 'Coefficient' },
    })
      .then(() => setIsLoading(false))
      .catch(() => {
        setError('Failed to render the plot.');
        setIsLoading(false);
      });
  }, [path, lambdaIdx]);

  return (
    <div className="w-full h-96">
      {isLoading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      <div id="solutionPlot" style={{ display: isLoading || error ? 'none' : 'block' }}></div>
    </div>
  );
};

export default SolutionPathPlot;