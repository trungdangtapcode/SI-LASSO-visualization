import React from 'react';

interface DataFormProps {
  params: { n: number; beta1: number; beta2: number; sigma: number };
  setParams: (params: { n: number; beta1: number; beta2: number; sigma: number }) => void;
  onGenerate: () => void;
}

const DataForm: React.FC<DataFormProps> = ({ params, setParams, onGenerate }) => {
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
        <label className="block text-sm font-medium text-gray-700">Beta1:</label>
        <input
          type="number"
          step="0.1"
          value={params.beta1}
          onChange={(e) => setParams({ ...params, beta1: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Beta2:</label>
        <input
          type="number"
          step="0.1"
          value={params.beta2}
          onChange={(e) => setParams({ ...params, beta2: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
        />
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