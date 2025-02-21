import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

interface WalletContextType {
    walletAddress: string | null;
    setWalletAddress: (address: string | null) => void;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(() => {
        return localStorage.getItem("walletAddress") || null;
    });

    useEffect(() => {
        if (walletAddress) {
            localStorage.setItem("walletAddress", walletAddress);
        } else {
            localStorage.removeItem("walletAddress");
        }
    }, [walletAddress]);

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.send("eth_accounts", []);
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                } catch (error) {
                    console.error("Error checking wallet connection:", error);
                }
            }
        };

        checkConnection();

        // Detect account change in MetaMask
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                } else {
                    disconnectWallet();
                }
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", () => {});
            }
        };
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
            } catch (error) {
                console.error("Wallet connection failed:", error);
                alert("Failed to connect wallet. Please try again.");
            }
        } else {
            alert("Please install MetaMask.");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        localStorage.removeItem("walletAddress");
    };

    return (
        <WalletContext.Provider value={{ walletAddress, setWalletAddress, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
