import React from 'react';

const AnimatedWaveform: React.FC<{ className?: string; isActive?: boolean }> = ({ 
  className = "", 
  isActive = true 
}) => {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`bg-gradient-to-t from-blue-400 to-purple-500 rounded-full transition-all duration-300 ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            width: '4px',
            height: isActive ? `${Math.random() * 20 + 10}px` : '8px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedWaveform;