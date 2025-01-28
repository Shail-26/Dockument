import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="page-transition min-h-screen pt-16 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-8">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Oops! Looks like this file got lost in the blockchain. Let's get you back to safety.
        </p>
        <Link to="/" className="gradient-btn inline-flex items-center">
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
}