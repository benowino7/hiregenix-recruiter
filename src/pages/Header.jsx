// RecruiterUnauthenticatedHeader.jsx
import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Briefcase, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../themes/ThemeContext';

const navItems = [
  { name: 'Home', path: '/#home' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'How It Works', path: '/#how_it_works' },
  { name: 'Contact', path: '/contact' },
];

export default function RecruiterHeader() {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Track current location (path + hash) for active link highlighting
  const [currentLocation, setCurrentLocation] = useState(
    window.location.pathname + window.location.hash
  );

  useEffect(() => {
    const updateActive = () => {
      setCurrentLocation(window.location.pathname + window.location.hash);
    };

    // Handle browser back/forward
    window.addEventListener('popstate', updateActive);

    // Handle regular <a> navigation (small delay to let browser finish)
    const handleClick = () => {
      setTimeout(updateActive, 50);
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('popstate', updateActive);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  // Determine if a nav item should be marked as active
  const isActive = (path) => {
    if (path.includes('#')) {
      const [basePath, hashPart] = path.split('#');
      return (
        window.location.pathname === basePath &&
        window.location.hash === `#${hashPart}`
      );
    }
    // For non-hash paths
    return currentLocation.startsWith(path) && !path.includes('#');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-teal-600/30 bg-white/90 backdrop-blur-xl dark:bg-gray-950/90 dark:border-teal-500/40 transition-colors duration-300 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">

          {/* Logo + Mobile Menu Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <a
              href="https://candidate.hiregenix.ai"
              className="flex items-center text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight"
              onClick={closeMenu}
            >
              <span className="text-teal-600 dark:text-teal-500">Top</span>
              <span className="text-gray-900 dark:text-white">Dubai</span>
              <span className="text-teal-600 dark:text-teal-500">Jobs</span>
            </a>
          </div>

          {/* Desktop Navigation – using <a> */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8 xl:gap-10">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className={`font-medium text-base transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-teal-600 dark:text-teal-400 font-semibold underline underline-offset-8 decoration-teal-500'
                    : 'text-gray-700 hover:text-teal-600 dark:text-gray-200 dark:hover:text-teal-400'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Actions - Unauthenticated */}
          <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">
            <a
              href="/contact"
              className="hidden lg:inline-flex px-5 py-2.5 text-sm md:text-base font-semibold rounded-xl border-2 border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-800 dark:hover:text-teal-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              Request Demo
            </a>

            <a
              href="/register"
              className="hidden lg:inline-flex px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 items-center gap-2"
            >
              <Building2 size={18} />
              Start Hiring
            </a>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-teal-600/90 hover:bg-teal-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-16 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="h-full bg-white dark:bg-gray-950 overflow-y-auto px-5 py-8">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={closeMenu}
                className={`block py-4 px-5 text-lg font-medium rounded-xl transition-colors ${
                  isActive(item.path)
                    ? 'bg-teal-50 text-teal-700 dark:bg-orange-950/40 dark:text-teal-400 font-semibold'
                    : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="mt-10 flex flex-col gap-4 px-5">
            <a
              href="/contact"
              className="py-4 px-6 text-center font-semibold rounded-xl border-2 border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow"
              onClick={closeMenu}
            >
              Request Demo
            </a>
            <a
              href="/register"
              className="py-4 px-6 text-center font-semibold text-lg rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white shadow-lg transition-colors"
              onClick={closeMenu}
            >
              Start Hiring Now
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}