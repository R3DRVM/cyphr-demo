import React, { useState, useRef, useEffect } from 'react';
import { useAccentColor } from '../contexts/ColorContext';

const ColorPicker: React.FC = () => {
  const { accentColor, setAccentColor } = useAccentColor();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(accentColor);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Sync selectedColor with accentColor from context
  useEffect(() => {
    setSelectedColor(accentColor);
  }, [accentColor]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setAccentColor(color);
  };

  const presetColors = [
    '#6D92CB', // New Blue (Default)
    '#1e40af', // Deep Blue
    '#374151', // Charcoal
    '#475569', // Slate Gray
    '#059669', // Forest Green
    '#991b1b', // Burgundy
    '#7c3aed', // Purple
    '#4338ca', // Indigo
    '#dc2626', // Red
    '#ea580c', // Orange
    '#ca8a04', // Yellow
    '#2dd4bf', // Original Teal
  ];

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl border-2 border-cyphr-gray/30 hover:border-cyphr-gray/50 transition-all duration-300 flex items-center justify-center group elite-button"
        style={{ backgroundColor: selectedColor }}
        title="Change Accent Color"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 z-50 bg-cyphr-black border border-cyphr-gray/30 rounded-xl p-4 shadow-elite min-w-[280px]">
          <div className="mb-4">
            <h3 className="text-cyphr-white font-semibold text-sm mb-2">Accent Color</h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-8 rounded border border-cyphr-gray/30 cursor-pointer"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-cyphr-dark-gray border border-cyphr-gray/30 rounded-lg text-cyphr-white text-sm font-mono"
                placeholder="#2dd4bf"
              />
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-cyphr-gray text-xs font-semibold mb-2 uppercase tracking-wide">Preset Colors</h4>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    selectedColor === color ? 'border-cyphr-white' : 'border-cyphr-gray/30'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleColorChange('#6D92CB')}
              className="flex-1 px-3 py-2 bg-cyphr-dark-gray hover:bg-cyphr-gray text-cyphr-white text-sm rounded-lg transition-all duration-200"
            >
              Reset to Blue
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 bg-cyphr-dark-gray hover:bg-cyphr-gray text-cyphr-white text-sm rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 