import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  showArrow?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  icon,
  showArrow = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = "relative overflow-hidden font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-300 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 focus:ring-gray-300 shadow-md hover:shadow-lg",
    outline: "border-2 border-white text-white hover:bg-white hover:text-gray-900 focus:ring-white"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 transition-all duration-700 hover:translate-x-full" />
      
      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {icon && <span>{icon}</span>}
            <span>{children}</span>
            {showArrow && (
              <ArrowRight 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isHovered ? 'translate-x-1' : ''
                }`} 
              />
            )}
          </>
        )}
      </div>
    </button>
  );
};

export default AnimatedButton;