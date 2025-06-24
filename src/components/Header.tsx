import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    transparent && !isScrolled
      ? 'bg-transparent'
      : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/20 dark:border-gray-700/20'
  }`;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Agently.ai
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/marketplace" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Marketplace
            </Link>
            <Link 
              to="#"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === "/" || window.location.pathname === "/landing") {
                  const section = document.getElementById("pricing-section");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                } else {
                  window.location.href = "/#pricing-section";
                }
              }}
            >
              Pricing
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Dashboard
            </Link>
            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="ml-2 bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-2 bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </nav>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-b-lg border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                to="/marketplace" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                to="#"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/" || window.location.pathname === "/landing") {
                    const section = document.getElementById("pricing-section");
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                  } else {
                    window.location.href = "/#pricing-section";
                  }
                }}
              >
                Pricing
              </Link>
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-center font-medium hover:bg-blue-50 transition-all duration-300"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-center font-medium hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;