import React, { useEffect } from 'react';

interface ChipItem {
  label: string;
  payload: any;
  hotkey?: string;
}

interface ChipRowProps {
  items: ChipItem[];
  onSelect: (payload: any) => void;
  onHide?: () => void;
}

export function ChipRow({ items, onSelect, onHide }: ChipRowProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      const chip = items.find(item => item.hotkey === key);
      
      if (chip) {
        event.preventDefault();
        onSelect(chip.payload);
        onHide?.();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [items, onSelect, onHide]);

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            onSelect(item.payload);
            onHide?.();
          }}
          className="group relative px-5 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 text-sm transition-all duration-200 border border-blue-600/30 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 max-w-full"
          title={item.hotkey ? `Press ${item.hotkey} or click` : undefined}
        >
          <span className="flex items-center gap-3 break-words">
            {item.hotkey && (
              <span className="text-xs bg-blue-600/50 group-hover:bg-blue-500/60 px-2 py-1 rounded-lg text-blue-100 font-medium transition-colors flex-shrink-0">
                {item.hotkey}
              </span>
            )}
            <span className="font-medium break-words">{item.label}</span>
          </span>
          
          {/* Hover effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-200" />
        </button>
      ))}
    </div>
  );
}
