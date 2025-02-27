import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    provider: BrowserProvider | null;
    isConnecting: boolean;
    error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(() => {
        // Restore wallet address from localStorage (from old version)
        return localStorage.getItem('walletAddress') || null;
    });
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Persist wallet address to localStorage (from old version)
    useEffect(() => {
        if (walletAddress) {
            localStorage.setItem('walletAddress', walletAddress);
        } else {
            localStorage.removeItem('walletAddress');
        }
    }, [walletAddress]);

    // Check if wallet is already connected on mount (improved from both)
    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const ethProvider = new BrowserProvider(window.ethereum);
                    const accounts = await ethProvider.send('eth_accounts', []);
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setProvider(ethProvider);
                    }
                } catch (err) {
                    console.error('Failed to check wallet connection:', err);
                }
            }
        };

        checkConnection();
    }, []);

    // Listen for account changes (combined logic from both)
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else if (accounts[0] !== walletAddress) {
                    // Only update if the account actually changes
                    setWalletAddress(accounts[0]);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [walletAddress]); // Add walletAddress as dependency to ensure updates

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
            }

            const ethProvider = new BrowserProvider(window.ethereum);
            const accounts = await ethProvider.send('eth_requestAccounts', []);

            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setProvider(ethProvider);
            } else {
                throw new Error('No accounts found. Please check your MetaMask configuration.');
            }
        } catch (err) {
            console.error('Failed to connect wallet:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
            setWalletAddress(null); // Reset on failure (consistent with old behavior)
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setProvider(null);
        localStorage.removeItem('walletAddress'); // Ensure localStorage is cleared (from old version)
    };

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                connectWallet,
                disconnectWallet,
                provider,
                isConnecting,
                error,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

// TypeScript declaration for window.ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}