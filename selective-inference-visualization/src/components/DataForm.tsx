import React from 'react';

interface DataFormProps {
  params: { n: number; m: number; betas: number[]; sigma: number };
  setParams: (params: { n: number; m: number; betas: number[]; sigma: number }) => void;
  onGenerate: () => void;
}

const DataForm: React.FC<DataFormProps> = ({ params, setParams, onGenerate }) => {
  // Handle change in m to adjust betas array length
  const handleMChange = (newM: number) => {
    const newBetas = params.betas.slice(0, newM);
    while (newBetas.length < newM) {
      newBetas.push(0); // Initialize new beta coefficients to 0
    }
    setParams({ ...params, m: newM, betas: newBetas });
  };

  // Handle change in individual beta
  const handleBetaChange = (index: number, value: number) => {
    const newBetas = [...params.betas];
    newBetas[index] = value;
    setParams({ ...params, betas: newBetas });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Samples (n):</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={params.n}
          onChange={(e) => setParams({ ...params, n: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Features (m):</label>
        <input
          type="number"
          min="1"
          max="100"
          value={params.m}
          onChange={(e) => handleMChange(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Beta Coefficients:</label>
        {Array.from({ length: params.m }, (_, index) => (
          <div key={index}>
            <label className="block text-sm text-gray-600">Beta {index + 1}:</label>
            <input
              type="number"
              step="0.1"
              value={params.betas[index] || 1}
              onChange={(e) => handleBetaChange(index, parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Noise (sigma):</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={params.sigma}
          onChange={(e) => setParams({ ...params, sigma: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
        />
      </div>
      <button
        onClick={onGenerate}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
      >
        Generate Data
      </button>
    </div>
  );
};

export default DataForm;