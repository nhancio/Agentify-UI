import React, { useState, useEffect } from 'react';
import { Phone, Bot, Mic, FileText, CheckCircle } from 'lucide-react';

const CallFlowAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { icon: Phone, label: 'Incoming Call', color: 'blue' },
    { icon: Bot, label: 'AI Responds', color: 'purple' },
    { icon: Mic, label: 'Records Conversation', color: 'green' },
    { icon: FileText, label: 'Generates Transcript', color: 'orange' },
    { icon: CheckCircle, label: 'Creates Summary', color: 'emerald' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-8 py-12">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center space-y-3">
          <div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
              index === activeStep
                ? `bg-${step.color}-500 scale-110 shadow-lg`
                : index < activeStep
                ? `bg-${step.color}-400`
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <step.icon
              className={`w-8 h-8 transition-colors duration-500 ${
                index <= activeStep ? 'text-white' : 'text-gray-400'
              }`}
            />
            
            {/* Pulse animation for active step */}
            {index === activeStep && (
              <div className={`absolute inset-0 rounded-full bg-${step.color}-500 animate-ping opacity-75`} />
            )}
          </div>
          
          <span
            className={`text-sm font-medium transition-colors duration-500 ${
              index <= activeStep
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {step.label}
          </span>
          
          {/* Arrow between steps */}
          {index < steps.length - 1 && (
            <div
              className={`absolute top-8 left-20 w-8 h-0.5 transition-colors duration-500 ${
                index < activeStep
                  ? `bg-${step.color}-400`
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              style={{ transform: 'translateX(50%)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CallFlowAnimation;