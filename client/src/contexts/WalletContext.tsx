import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    provider: BrowserProvider | null;
    isConnecting: boolean;
    error: string | null;
    refreshFiles: () => void; // NEW: Trigger to refresh file data
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(() => {
        return localStorage.getItem('walletAddress') || null;
    });
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // NEW: State to trigger refresh

    // Persist wallet address to localStorage
    useEffect(() => {
        if (walletAddress) {
            localStorage.setItem('walletAddress', walletAddress);
        } else {
            localStorage.removeItem('walletAddress');
        }
    }, [walletAddress]);

    // Check if wallet is already connected on mount
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

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else if (accounts[0] !== walletAddress) {
                    setWalletAddress(accounts[0]);
                    setRefreshTrigger(prev => prev + 1); // NEW: Refresh files on account change
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [walletAddress]);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
            }

            const ethProvider = new BrowserProvider(window.ethereum);
            const accounts = await ethProvider.send('eth_requestAccounts', []);
            console.log(accounts);
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setProvider(ethProvider);
                setRefreshTrigger(prev => prev + 1); // NEW: Refresh files after connecting
            } else {
                throw new Error('No accounts found. Please check your MetaMask configuration.');
            }
        } catch (err) {
            console.error('Failed to connect wallet:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
            setWalletAddress(null);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setProvider(null);
        localStorage.removeItem('walletAddress');
        setRefreshTrigger(prev => prev + 1); // NEW: Refresh files after disconnecting
    };

    const refreshFiles = () => {
        setRefreshTrigger(prev => prev + 1); // NEW: Function to manually trigger refresh
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
                refreshFiles, // NEW: Expose refreshFiles in context
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

declare global {
    interface Window {
        ethereum: any;
    }
}