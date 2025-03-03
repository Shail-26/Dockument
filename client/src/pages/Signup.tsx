import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

export function Signup() {
  const { walletAddress, connectWallet: connectWalletFromContext, provider } = useWallet();
  const [isTermsChecked, setIsTermsChecked] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number | null>(null);
  const navigate = useNavigate();
  const ISSUER_ADDRESS = "0x52a2Ec069b79AE3394cEC467AEe4ca045CaDD7c7"; // Hardcoded issuer address

  // Check stored wallet and last activity on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedTimestamp = localStorage.getItem('lastActivity');

    if (storedAddress && storedTimestamp) {
      const currentTime = Date.now();
      const inactiveDuration = currentTime - parseInt(storedTimestamp, 10);
      const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

      if (inactiveDuration < fiveDaysInMs) {
        setLastActivity(parseInt(storedTimestamp, 10));
        // Note: walletAddress is already set by WalletProvider, no need to set it here
        // Redirect based on role (commented out as per original)
        // if (storedAddress.toLowerCase() === ISSUER_ADDRESS.toLowerCase()) {
        //   navigate('/issuer-dashboard');
        // } else {
        //   navigate('/documents');
        // }
      } else {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('lastActivity');
      }
    }
  }, [navigate]);

  const connectWallet = async () => {
    if (!isTermsChecked) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    try {
      // Use the context's connectWallet function
      await connectWalletFromContext();

      // After connection, provider and walletAddress should be set by WalletProvider
      if (!provider || !walletAddress) {
        throw new Error("Failed to connect wallet properly.");
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const currentTime = Date.now();
      setLastActivity(currentTime);

      localStorage.setItem('lastActivity', currentTime.toString());

      const message = "Please sign this message to verify your identity.";
      const signature = await signer.signMessage(message);

      const response = await fetch('http://localhost:5000/api/verify-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature }),
      });

      if (response.ok) {
        console.log('Wallet verified successfully!');
        // Redirect based on issuer status (uncomment as needed)
        // if (address.toLowerCase() === ISSUER_ADDRESS.toLowerCase()) {
        //   navigate('/issuer-dashboard');
        // } else {
        //   navigate('/documents');
        // }
      } else {
        console.error('Wallet verification failed.');
      }
    } catch (error) {
      console.error("User denied account access or error occurred:", error);
      alert("Failed to connect or verify wallet. Please try again.");
    }
  };

  const handleTermsCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsChecked(e.target.checked);
  };

  return (
    <div className="page-transition min-h-screen pt-16 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-8">Connect Your Wallet</h1>

          <div className="space-y-6">
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

            {walletAddress && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 break-words">
                Connected Wallet: {walletAddress}
                <br />
                {walletAddress.toLowerCase() === ISSUER_ADDRESS.toLowerCase()
                  ? "Role: Issuer"
                  : "Role: Normal User"}
              </div>
            )}

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