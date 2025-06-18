import React from 'react';
import { Phone, MessageSquare, Calendar, Bot, Users, Zap } from 'lucide-react';

const FloatingElements: React.FC = () => {
  const elements = [
    { Icon: Phone, delay: 0, duration: 6 },
    { Icon: MessageSquare, delay: 1, duration: 8 },
    { Icon: Calendar, delay: 2, duration: 7 },
    { Icon: Bot, delay: 3, duration: 9 },
    { Icon: Users, delay: 4, duration: 6 },
    { Icon: Zap, delay: 5, duration: 8 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map(({ Icon, delay, duration }, index) => (
        <div
          key={index}
          className="absolute opacity-10 dark:opacity-5"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        >
          <Icon 
            className="w-8 h-8 text-blue-500 animate-bounce"
            style={{
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;