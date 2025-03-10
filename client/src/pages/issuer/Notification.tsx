import React from 'react';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface NotificationProps {
    notification: {
        type: 'success' | 'error';
        message: string;
        txHash?: string;
    } | null;
}

export function Notification({ notification }: NotificationProps) {
    if (!notification) return null;

    return (
        <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
                notification.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
        >
            {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <div>
                <p>{notification.message}</p>
                {notification.txHash && (
                    <a
                        href={`http://127.0.0.1:8545/tx/${notification.txHash}`} // Update for testnet if needed
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center mt-1 text-sm underline"
                    >
                        View Transaction
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                )}
            </div>
        </div>
    );
}