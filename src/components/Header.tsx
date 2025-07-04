import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = `fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
    transparent && !isScrolled
      ? 'bg-transparent'
      : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/20 dark:border-gray-700/20'
  }`;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo left-aligned */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Agentlybot.com
            </span>
          </Link>

          {/* Navigation right-aligned */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto">
            <Link 
              to="/marketplace" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Marketplace
            </Link>
            <button
              type="button"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={e => {
                e.preventDefault();
                if (window.location.pathname === "/" || window.location.pathname === "/landing") {
                  const section = document.getElementById("blogs-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.location.href = "/#blogs-section";
                }
              }}
            >
              Blogs
            </button>
            <Link 
              to="#"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              onClick={e => {
                e.preventDefault();
                if (window.location.pathname === "/" || window.location.pathname === "/landing") {
                  const section = document.getElementById("pricing-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.location.href = "/#pricing-section";
                }
              }}
            >
              Pricing
            </Link>
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
          <div className="md:hidden absolute top-16 left-0 right-0 w-full bg-white dark:bg-gray-900 shadow-lg rounded-b-lg border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                to="/marketplace" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <button
                type="button"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2 text-left"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={e => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  if (window.location.pathname === "/" || window.location.pathname === "/landing") {
                    const section = document.getElementById("blogs-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/#blogs-section";
                  }
                }}
              >
                Blogs
              </button>
              <Link 
                to="#"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                onClick={e => {
                  e.preventDefault();
                  if (window.location.pathname === "/" || window.location.pathname === "/landing") {
                    const section = document.getElementById("pricing-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/#pricing-section";
                  }
                  setIsMenuOpen(false);
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
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await signOut();
                    navigate('/');
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