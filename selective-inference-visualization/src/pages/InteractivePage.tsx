import React, { useState, useEffect } from 'react';
import DataForm from '@/components/DataForm';
import LambdaSlider from '@/components/LambdaSlider';
import SolutionPathPlot from '@/components/SolutionPathPlot';
import CoefficientsBarChart from '@/components/CoefficientsBarChart';
import PresetButtons from '@/components/PresetButtons';
import { generateData, computeLassoPath, type LassoPathEntry } from '@/utils/lassoUtils';
import '../App.css';
import type { GeneratedData } from '@/types/GeneratedData';

const InteractivePage = () => {
  const [params, setParams] = useState({ n: 10, beta1: 1, beta2: 1, sigma: 1 });
  const [data, setData] = useState<GeneratedData|null>(null);
  const [path, setPath] = useState<LassoPathEntry[]>([]);
  const [lambdaIdx, setLambdaIdx] = useState(0);

  const handleGenerate = () => {
    const newData = generateData(params.n, params.beta1, params.beta2, params.sigma);
    setData(newData);
    const lambdaMax = Math.max(...newData.X.transpose().mmul(newData.y).abs().to1DArray());
    const lambdaGrid = Array.from({ length: 100 }, (_, i) => lambdaMax * (1 - i / 99));
    const newPath = computeLassoPath(newData.X, newData.y, lambdaGrid);
    console.log('Generated Data:', newData);
    console.log('LASSO Path:', newPath);
    setPath(newPath);
    setLambdaIdx(0);
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/4 p-6 bg-white shadow-md">
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        <DataForm params={params} setParams={setParams} onGenerate={handleGenerate} />
        {path.length > 0 && (
          <LambdaSlider
            lambdaIdx={lambdaIdx}
            setLambdaIdx={setLambdaIdx}
            lambdaGrid={path.map((p) => p.lambda)}
          />
        )}
        <PresetButtons setParams={setParams} onGenerate={handleGenerate} />
      </div>
      <div className="w-full md:w-3/4 p-6">
        <h1 className="text-2xl font-bold mb-4">LASSO Selective Inference Visualizer</h1>
        {data && (
          <>
            <SolutionPathPlot path={path} lambdaIdx={lambdaIdx} />
            <CoefficientsBarChart path={path} lambdaIdx={lambdaIdx} X={data.X} y={data.y} />
            <div className="mt-6 prose">
              <h3>What is LASSO Regression?</h3>
              <p>LASSO performs feature selection and regularization by adding a penalty on the absolute size of coefficients.</p>
              <h3>Why Selective Inference?</h3>
              <p>It corrects for selection bias, providing valid statistical inferences after model selection.</p>
              <h3>Naive vs Selective CIs</h3>
              <p>Naive CIs ignore selection, often leading to bias, while selective CIs adjust for it.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InteractivePage;