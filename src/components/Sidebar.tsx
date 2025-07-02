import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Store, 
  BarChart3, 
  Settings, 
  CreditCard,
  Users,
  Phone,
  Video,
  Mic,
  Moon,
  Sun,
  User,
  Bell,
  Shield,
  Globe,
  Key,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'My Video Agents', href: '/my-video-agents', icon: Users },
  { name: 'Video Call History', href: '/video-agents', icon: Video },
  { name: 'My Audio Agents', href: '/voice-agents', icon: Mic },
  { name: 'Voice Call History', href: '/calls', icon: Phone },
];

interface SidebarProps {
  profile?: any;
  loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ profile, loading }) => {
  const location = useLocation();
  const navigate = useNavigate(); // add useNavigate
  const { googleProfile, signOut } = useAuth();
  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains('dark')
  );
  const [open, setOpen] = React.useState(false);

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

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-900 p-2 rounded shadow"
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 pt-16
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile - direct navigation to /profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div 
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg transition-colors duration-300 cursor-pointer relative"
              onClick={() => navigate('/profile')}
            >
              <div className="flex items-center">
                {googleProfile?.avatar ? (
                  <img
                    src={googleProfile.avatar}
                    alt={googleProfile.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={e => {
                      // fallback to initials if image fails to load (e.g., 429 error)
                      (e.target as HTMLImageElement).style.display = 'none';
                      // Optionally, you could set a state to show initials instead
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {googleProfile?.name
                        ? googleProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                        : 'JD'}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {googleProfile?.name || 'John Doe'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {googleProfile?.plan || googleProfile?.email || 'Premium Plan'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;