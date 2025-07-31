import React, { createContext, useContext, useState, useEffect } from 'react';

interface ColorContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useAccentColor = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useAccentColor must be used within a ColorProvider');
  }
  return context;
};

interface ColorProviderProps {
  children: React.ReactNode;
}

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const [accentColor, setAccentColor] = useState('#6D8FC7'); // New blue color

  // Update CSS custom property when accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--cyphr-teal', accentColor);
    
    // Create gradient end color (darker version)
    const gradientEnd = '#29589F';
    
    // Update all teal-related colors
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --cyphr-teal: ${accentColor} !important;
        --cyphr-teal-gradient: ${gradientEnd} !important;
      }
      
      .text-cyphr-teal {
        color: ${accentColor} !important;
      }
      
      .bg-cyphr-teal {
        background-color: ${accentColor} !important;
      }
      
      .bg-cyphr-teal-gradient {
        background: linear-gradient(135deg, ${accentColor} 0%, ${gradientEnd} 100%) !important;
      }
      
      .border-cyphr-teal {
        border-color: ${accentColor} !important;
      }
      
      .hover\\:text-cyphr-teal:hover {
        color: ${accentColor} !important;
      }
      
      .hover\\:border-cyphr-teal:hover {
        border-color: ${accentColor} !important;
      }
      
      .focus\\:border-cyphr-teal:focus {
        border-color: ${accentColor} !important;
      }
      
      .cyphr-button-primary {
        background: linear-gradient(135deg, ${accentColor} 0%, ${gradientEnd} 100%) !important;
        border-color: ${accentColor} !important;
      }
      
      .cyphr-button-primary:hover {
        background: linear-gradient(135deg, ${gradientEnd} 0%, ${accentColor} 100%) !important;
      }
      
      .ios-button-primary {
        background: linear-gradient(135deg, ${accentColor} 0%, ${gradientEnd} 100%) !important;
      }
      
      .ios-button-primary:hover {
        background: linear-gradient(135deg, ${gradientEnd} 0%, ${accentColor} 100%) !important;
      }
      
      .elite-button-primary {
        background: linear-gradient(135deg, rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.3) 0%, rgba(${parseInt(gradientEnd.slice(1, 3), 16)}, ${parseInt(gradientEnd.slice(3, 5), 16)}, ${parseInt(gradientEnd.slice(5, 7), 16)}, 0.2) 100%) !important;
        border-color: ${accentColor} !important;
      }
      
      .elite-button-primary:hover {
        background: linear-gradient(135deg, rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.4) 0%, rgba(${parseInt(gradientEnd.slice(1, 3), 16)}, ${parseInt(gradientEnd.slice(3, 5), 16)}, ${parseInt(gradientEnd.slice(5, 7), 16)}, 0.3) 100%) !important;
        border-color: ${accentColor} !important;
      }
    `;
    
    // Remove previous style if exists
    const existingStyle = document.getElementById('dynamic-accent-color');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.id = 'dynamic-accent-color';
    document.head.appendChild(style);
  }, [accentColor]);

  return (
    <ColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ColorContext.Provider>
  );
}; 