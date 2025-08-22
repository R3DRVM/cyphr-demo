import React from 'react';

interface ChipGroupProps {
  options: string[];
  onPick: (value: string) => void;
}

export default function ChipGroup({ options, onPick }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onPick(option)}
          className="px-3 py-1 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 text-xs transition-colors"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
