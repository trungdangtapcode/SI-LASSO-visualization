import React from 'react';

interface Preset {
  name: string;
  params: {
    n: number;
    m: number;
    betas: number[];
    sigma: number;
  };
}

interface PresetButtonsProps {
  setParams: (params: { n: number; m: number; betas: number[]; sigma: number }) => void;
  onGenerate: () => void;
}

const PresetButtons: React.FC<PresetButtonsProps> = ({ setParams, onGenerate }) => {
  const presets: Preset[] = [
    { name: 'All Significant', params: { n: 100, m: 2, betas: [1, 1], sigma: 1 } },
    { name: 'One Zero', params: { n: 100, m: 2, betas: [1, 0], sigma: 1 } },
    { name: 'Weak Signals', params: { n: 100, m: 2, betas: [0.2, 0.3], sigma: 1 } },
  ];

  return (
    <div className="mt-4 space-y-2">
      {presets.map((preset) => (
        <button
          key={preset.name}
          onClick={() => {
            setParams(preset.params);
            onGenerate();
          }}
          className="w-full bg-gray-200 p-2 rounded-md hover:bg-gray-300"
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
};

export default PresetButtons;