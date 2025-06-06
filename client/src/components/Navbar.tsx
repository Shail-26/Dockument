import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Upload,FolderOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useWallet } from '../contexts/WalletContext';

export function Navbar() {
  const ISSUER_ADDRESS = "0x52a2ec069b79ae3394cec467aee4ca045cadd7c7"; // Hardcoded issuer address
  const { walletAddress } = useWallet();

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="../../lock.png" alt="Lock Icon" className="w-8 h-8" />
            <span className="font-poppins font-bold text-xl">Dockument</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {walletAddress?.toLowerCase() === ISSUER_ADDRESS.toLowerCase() && (
              <Link to="/issuer-dashboard" className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Issuer Dashboard</Link>
            )}
            {/* <Link to="/features" className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"> */}
            <Link to="/documents" className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              <FolderOpen className="w-5 h-5" />
              <span>My Documents</span>
            </Link>
            <Link to="/about" className="nav-link">About</Link>
            {/* <Link to="/contact" className="nav-link">Contact</Link> */}
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