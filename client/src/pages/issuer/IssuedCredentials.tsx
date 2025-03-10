import React, { useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react'; // Double-check this import

interface Credential {
    fileHash: string;
    receiver: string;
    metadata: string;
    status: 'Active' | 'Revoked' | 'Deleted';
    timestamp: number;
    revokedFields: string[];
}

interface IssuedCredentialsProps {
    credentials: Credential[];
    isLoading: boolean;
    isSubmitting: boolean;
    handleRevokeCredentialField: (fileHash: string, field: string) => Promise<void>;
    handleRevokeCredential: (fileHash: string) => Promise<void>;
}

export function IssuedCredentials({
    credentials,
    isLoading,
    isSubmitting,
    handleRevokeCredentialField,
    handleRevokeCredential,
}: IssuedCredentialsProps) {
    const [revokeField, setRevokeField] = useState<string>('');

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-6">Issued Credentials</h2>
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <svg
                        className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            ) : credentials.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">No credentials issued yet</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                <th className="pb-3 font-semibold">File Hash</th>
                                <th className="pb-3 font-semibold">Receiver</th>
                                <th className="pb-3 font-semibold">Metadata</th>
                                <th className="pb-3 font-semibold">Revoked Fields</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold">Issued On</th>
                                <th className="pb-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {credentials.map((credential, index) => {
                                let parsedMetadata;
                                try {
                                    parsedMetadata = JSON.parse(credential.metadata);
                                } catch (e) {
                                    parsedMetadata = { error: 'Invalid JSON' };
                                }

                                return (
                                    <tr key={index} className="group">
                                        <td className="py-4">
                                            <a
                                                href={`https://ipfs.io/ipfs/${credential.fileHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                <span className="truncate max-w-[150px]">{credential.fileHash}</span>
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-mono text-sm truncate max-w-[150px] block">
                                                {credential.receiver}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="max-w-[200px] truncate">
                                                {parsedMetadata.name && (
                                                    <span className="font-medium">{parsedMetadata.name}</span>
                                                )}
                                                {parsedMetadata.type && (
                                                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                                        ({parsedMetadata.type})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {credential.revokedFields.length > 0
                                                    ? credential.revokedFields.join(', ')
                                                    : 'None'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    credential.status === 'Active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : credential.status === 'Revoked'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}
                                            >
                                                {credential.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(credential.timestamp)}
                                        </td>
                                        <td className="py-4 flex space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Field to revoke"
                                                value={revokeField}
                                                onChange={(e) => setRevokeField(e.target.value)}
                                                className="input-field w-32 text-sm"
                                                disabled={credential.status !== 'Active' || isSubmitting}
                                            />
                                            <button
                                                onClick={() => handleRevokeCredentialField(credential.fileHash, revokeField)}
                                                disabled={credential.status !== 'Active' || isSubmitting || !revokeField}
                                                className={`p-2 rounded-full transition-colors ${
                                                    credential.status === 'Active' && !isSubmitting && revokeField
                                                        ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                                                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                }`}
                                                title="Revoke Field"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleRevokeCredential(credential.fileHash)}
                                                disabled={credential.status !== 'Active' || isSubmitting}
                                                className={`p-2 rounded-full transition-colors ${
                                                    credential.status === 'Active' && !isSubmitting
                                                        ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                                                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                }`}
                                                title="Revoke Entire Credential"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}