import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';

interface SolutionPathPlotProps {
  path: { lambda: number, beta1: number, beta2: number }[];
  lambdaIdx: number;
}

const SolutionPathPlot: React.FC<SolutionPathPlotProps> = ({ path, lambdaIdx }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const data = [
      { x: path.map((p) => p.lambda), y: path.map((p) => p.beta1), name: 'Beta1', type: 'scatter' },
      { x: path.map((p) => p.lambda), y: path.map((p) => p.beta2), name: 'Beta2', type: 'scatter' },
      {
        x: [path[lambdaIdx].lambda, path[lambdaIdx].lambda],
        y: [-2, 2],
        mode: 'lines',
        name: 'Selected Lambda',
        line: { dash: 'dash' },
      },
    ];
    Plotly.newPlot('solutionPlot', data, {
      title: 'LASSO Solution Path',
      xaxis: { title: 'Lambda' },
      yaxis: { title: 'Coefficient' },
    }).then(() =>{
      setIsLoading(false)
    });
  }, [path, lambdaIdx]);

  return (
    <div className="w-full h-96">
      {isLoading && <div className="loading-spinner">Loading...</div>}
      <div id="solutionPlot" style={{ display: isLoading ? 'none' : 'block' }}></div>
    </div>
  );
};

export default SolutionPathPlot;