import React, { useState } from "react";
import Kuvaira from "../assets/logos/kuvaira-logo.png";
import AviraEvents from "../assets/logos/avira-logo.png";
import IonSemiconductor from "../assets/logos/ion-logo.png";
import TejasAcademy from "../assets/logos/tejas-logo.png";

const LogoSlider: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const companies = [
    { name: "Kuvaira", logo: Kuvaira },
    { name: "Avira Events", logo: AviraEvents },
    { name: "Ion Semiconductor", logo: IonSemiconductor },
    { name: "Tejas Academy", logo: TejasAcademy },
    // { name: 'CloudSync', logo: 'CS' },
    // { name: 'NextGen', logo: 'NG' },
    // { name: 'SmartSys', logo: 'SS' },
    // { name: 'ProTech', logo: 'PT' }
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Trusted by leading companies worldwide
        </p>

        <div className="relative overflow-visible">
          <div className="flex animate-scroll space-x-12">
            {[...companies, ...companies].map((company, index) => {
              const isHovered = hoveredIndex === index;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
              return (
                <div
                  key={index}
                  className={`relative flex-shrink-0 flex flex-col items-center justify-center w-32 h-28 rounded-lg transition-all duration-300 group shadow-sm hover:shadow-md
                    ${
                      isHovered
                        ? "bg-white dark:bg-gray-800 ring-2 ring-blue-500 dark:ring-purple-400 scale-105"
                        : "bg-white dark:bg-gray-800"
                    }
                    ${isDimmed ? "opacity-40 blur-[1px]" : "opacity-100"}
                  `}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {isHovered && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-[99999]">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-[2px] rounded-md">
                        <span
                          className="px-4 py-2 rounded-md text-sm font-bold bg-gray-900/90 text-white shadow-lg block whitespace-nowrap max-w-xs truncate"
                          style={{
                            textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                          }}
                        >
                          {company.name}
                        </span>
                      </div>
                      <div className="h-2 flex items-center justify-center mb-2">
                        <span className="block w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm rotate-45 mt-[-6px]">
                          <span
                            className="block w-3 h-3 bg-gray-900/90 rounded-sm rotate-45 absolute left-0 top-0"
                            style={{
                              zIndex: 1,
                              transform: "translate(2px, 2px) scale(0.7)",
                            }}
                          ></span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-14 h-14 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md p-2`}
                  >
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;
