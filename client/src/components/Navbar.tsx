import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Upload } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="font-poppins font-bold text-xl">SecureChain Locker</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/upload" className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Link>
            <ThemeToggle />
            <Link to="/connect-wallet" className="gradient-btn">Connect Wallet</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}