// src/components/Issuer/IssuerDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Wallet } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { NotificationBanner } from './NotificationBanner';
import { CredentialFieldForm } from './CredentialFieldForm';
import { useIssuerActions } from '../../hooks/useIssuerActions';
import CredentialsTable from './CredentialsTable';
import { FormField } from '../../types';
import { ethers } from 'ethers';

const AUTHORIZED_ISSUER = "0x52a2ec069b79ae3394cec467aee4ca045cadd7c7";

export const IssuerDashboard = () => {
    const navigate = useNavigate();
    const { walletAddress, provider, refreshFiles } = useWallet();
    const {
        isSubmitting,
        notification,
        credentials,
        isLoading,
        handleIssueCredential,
        handleRevokeCredentialField,
        handleRevokeCredential,
        fetchCredentials,
        setNotification,
    } = useIssuerActions(walletAddress || '', provider, refreshFiles);

    const [fields, setFields] = useState<FormField[]>([{ key: '', value: '', isMandatory: false }]);
    const [receiverAddress, setReceiverAddress] = useState('');
    const [isValidReceiver, setIsValidReceiver] = useState(false);
    const [revokeField, setRevokeField] = useState('');

    // Authorization effect
    useEffect(() => {
        if (walletAddress && walletAddress.toLowerCase() !== AUTHORIZED_ISSUER.toLowerCase()) {
            navigate('/signup');
        }
    }, [walletAddress, navigate]);

    // Receiver validation effect
    useEffect(() => {
        setIsValidReceiver(ethers.isAddress(receiverAddress));
    }, [receiverAddress]);

    // Fetch credentials on mount or when walletAddress/provider changes
    useEffect(() => {
        if (walletAddress && provider) {
            fetchCredentials();
        }
    }, [walletAddress, provider]);

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleIssueCredential(fields, receiverAddress);
        setFields([{ key: '', value: '', isMandatory: false }]);
        setReceiverAddress('');
    };

    // Update field handler
    const updateField = (index: number, type: 'key' | 'value' | 'isMandatory', value: string | boolean) => {
        const updatedFields = fields.map((field, i) =>
            i === index ? { ...field, [type]: value } : field
        );
        setFields(updatedFields);
    };

    // Remove field handler
    const removeField = (index: number) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    // Add field handler
    const addField = () => {
        setFields([...fields, { key: '', value: '', isMandatory: false }]);
    };

    return (
        <div className="page-transition pt-16">
            {/* Header Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                        Issuer Dashboard
                    </h1>
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Wallet className="w-5 h-5 mr-2" />
                        <span className="font-mono text-sm">{walletAddress}</span>
                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            Issuer
                        </span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <NotificationBanner notification={notification} />

                    {/* Issue Credential Form */}
                    <div className="card mb-12">
                        <h2 className="text-2xl font-bold mb-6">Issue New Credential</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <CredentialFieldForm
                                fields={fields}
                                updateField={updateField}
                                removeField={removeField}
                                addField={addField}
                            />

                            {/* Receiver Address Input */}
                            <div>
                                <label htmlFor="receiverAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Receiver Address
                                </label>
                                <input
                                    type="text"
                                    id="receiverAddress"
                                    value={receiverAddress}
                                    onChange={(e) => setReceiverAddress(e.target.value)}
                                    placeholder="0x..."
                                    className={`input-field ${receiverAddress && !isValidReceiver ? 'border-red-500 dark:border-red-400' : ''}`}
                                    required
                                />
                                {receiverAddress && !isValidReceiver && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        Please enter a valid Ethereum address
                                    </p>
                                )}
                            </div>

                            <SubmitButton isSubmitting={isSubmitting} isValid={isValidReceiver} />
                        </form>
                    </div>

                    {/* Credentials Table */}
                    <CredentialsTable
                        credentials={credentials}
                        isLoading={isLoading}
                        revokeField={revokeField}
                        setRevokeField={setRevokeField}
                        onRevokeField={handleRevokeCredentialField}
                        onRevokeCredential={handleRevokeCredential}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </section>
        </div>
    );
};

const SubmitButton = ({ isSubmitting, isValid }: { isSubmitting: boolean; isValid: boolean }) => (
    <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="gradient-btn flex items-center justify-center"
    >
        {isSubmitting ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </>
        ) : (
            <>
                <Upload className="w-5 h-5 mr-2" />
                Issue Credential
            </>
        )}
    </button>
);