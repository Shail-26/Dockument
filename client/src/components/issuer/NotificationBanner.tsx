// src/components/Issuer/NotificationBanner.tsx
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { NotificationType } from '../../types';

export const NotificationBanner = ({ notification }: { notification: NotificationType | null }) => {
    if (!notification) return null;

    return (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${notification.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
            {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <div>
                <p>{notification.message}</p>
                {notification.txHash && (
                    <a
                        href={`http://127.0.0.1:8545/tx/${notification.txHash}`}
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
};