// pages/Signup.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext'; // Import useWallet

export function Signup() {
  const { walletAddress, setWalletAddress } = useWallet();
  const [isTermsChecked, setIsTermsChecked] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number | null>(null);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts(); // Get connected accounts
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
      } else {
        setWalletAddress(null);
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('lastActivity');
      }
    }
  };

  // Check for existing wallet connection on component mount
  useEffect(() => {
    checkWalletConnection();
    const storedAddress = localStorage.getItem('walletAddress');
    const storedTimestamp = localStorage.getItem('lastActivity');

    if (storedAddress && storedTimestamp) {
      const currentTime = Date.now();
      const inactiveDuration = currentTime - parseInt(storedTimestamp, 10);
      const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

      if (inactiveDuration < fiveDaysInMs) {
        // User is still within the 5-day window
        setWalletAddress(storedAddress);
        setLastActivity(parseInt(storedTimestamp, 10));
      } else {
        // Clear storage if inactive for more than 5 days
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('lastActivity');
        setWalletAddress(null);
      }
    }
  }, [setWalletAddress]);

  // Handle wallet connection
  const connectWallet = async () => {
    if (!isTermsChecked) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // Set the wallet address and update last activity timestamp
        setWalletAddress(address);
        const currentTime = Date.now();
        setLastActivity(currentTime);

        // Save to localStorage
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('lastActivity', currentTime.toString());

        // Optional: Send the address to your backend for verification
        const message = "Please sign this message to verify your identity.";
        const signature = await signer.signMessage(message);

        // Send address, message, and signature to your backend
        const response = await fetch('http://localhost:5000/api/verify-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, message, signature }),
        });

        if (response.ok) {
          console.log('Wallet verified successfully!');
        } else {
          console.error('Wallet verification failed.');
        }
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Handle terms checkbox change
  const handleTermsCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsChecked(e.target.checked);
  };

  return (
    <div className="page-transition min-h-screen pt-16 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-8">Connect Your Wallet</h1>

          <div className="space-y-6">
            {/* Connect Wallet Button */}
            <button
              onClick={connectWallet}
              disabled={!!walletAddress || !isTermsChecked}
              className={`w-full gradient-btn flex items-center justify-center ${
                walletAddress || !isTermsChecked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Wallet className="w-5 h-5 mr-2" />
              {walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </button>

            {/* Display Wallet Address */}
            {walletAddress && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 break-words">
                Connected Wallet: {walletAddress}
              </div>
            )}

            {/* Terms and Conditions */}
            {!walletAddress && (
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={isTermsChecked}
                  onChange={handleTermsCheckbox}
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}