import React from 'react';

const LogoSlider: React.FC = () => {
  const companies = [
    { name: 'TechCorp', logo: 'TC' },
    { name: 'InnovateLab', logo: 'IL' },
    { name: 'FutureWorks', logo: 'FW' },
    { name: 'DataFlow', logo: 'DF' },
    { name: 'CloudSync', logo: 'CS' },
    { name: 'NextGen', logo: 'NG' },
    { name: 'SmartSys', logo: 'SS' },
    { name: 'ProTech', logo: 'PT' }
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Trusted by leading companies worldwide
        </p>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-12">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex items-center justify-center w-24 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                  <span className="text-white font-bold text-sm">{company.logo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;