import React from 'react';
import { Wallet } from 'lucide-react';

interface IssuerHeaderProps {
    walletAddress: string;
}

export function IssuerHeader({ walletAddress }: IssuerHeaderProps) {
    return (
        <section className="py-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                            Issuer Dashboard
                        </h1>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Wallet className="w-5 h-5 mr-2" />
                            <span className="font-mono text-sm">{walletAddress}</span>
                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                Issuer
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}