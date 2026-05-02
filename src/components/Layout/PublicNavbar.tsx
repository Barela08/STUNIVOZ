import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from '../common';

export const PublicNavbar: React.FC = () => {
  const [isOpen, React_useState] = React.useState(false);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary-500" />
            <span className="font-display font-bold text-2xl text-gray-900 tracking-tight">STUNIVOZ</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/internships" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Internships</Link>
            <Link to="/courses" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Courses</Link>
            <Link to="/events" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Events</Link>
            <Link to="/community" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Community</Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-primary-600">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => React_useState(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-white border-b border-gray-100 shadow-lg absolute w-full left-0 top-20">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/internships" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Internships</Link>
            <Link to="/courses" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Courses</Link>
            <Link to="/events" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Events</Link>
            <Link to="/community" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Community</Link>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login">
                <Button variant="outline" className="w-full justify-center">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" className="w-full justify-center">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
