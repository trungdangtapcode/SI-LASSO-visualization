import React from 'react';

interface LambdaSliderProps {
  lambdaIdx: number;
  setLambdaIdx: (index: number) => void;
  lambdaGrid: number[];
}

const LambdaSlider: React.FC<LambdaSliderProps> = ({ lambdaIdx, setLambdaIdx, lambdaGrid }) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">
        Lambda: {lambdaGrid[lambdaIdx].toFixed(3)}
      </label>
      <input
        type="range"
        min="0"
        max={lambdaGrid.length - 1}
        value={lambdaIdx}
        onChange={(e) => setLambdaIdx(parseInt(e.target.value))}
        className="w-full mt-2"
      />
    </div>
  );
};

export default LambdaSlider;