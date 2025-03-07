import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Trash2, AlertCircle, CheckCircle, ExternalLink, Upload } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { Contract, ethers, isAddress } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from "../../contract_info.jsx";
import { parseUnits } from "ethers";
// Hardcoded issuer address (temporary)
const AUTHORIZED_ISSUER = "0x25ec157063bA1cC84d3781DB5F556D827AF3d09e";

interface Credential {
    fileHash: string;
    receiver: string;
    metadata: string;
    status: 'Active' | 'Revoked' | 'Deleted';
    timestamp: number;
    revokedFields: string[];
}

interface FormField {
    key: string;
    value: string;
    isMandatory?: boolean;
}

export function IssuerDashboard() {
    const navigate = useNavigate();
    const { walletAddress, provider, refreshFiles } = useWallet();

    const [fields, setFields] = useState<FormField[]>([{ key: '', value: '', isMandatory: false }]);
    const [receiverAddress, setReceiverAddress] = useState('');
    const [isValidReceiver, setIsValidReceiver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
        txHash?: string;
    } | null>(null);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [revokeField, setRevokeField] = useState<string>('');

    useEffect(() => {
        if (walletAddress && walletAddress.toLowerCase() !== AUTHORIZED_ISSUER.toLowerCase()) {
            navigate('/signup');
        }
    }, [walletAddress, navigate]);

    useEffect(() => {
        setIsValidReceiver(isAddress(receiverAddress));
    }, [receiverAddress]);

    useEffect(() => {
        const fetchCredentials = async () => {
            if (!walletAddress || !provider) return;

            setIsLoading(true);
            try {
                const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, provider);
                const issuedHashes = await contract.getIssuedCredentials(walletAddress);

                const creds: Credential[] = [];
                for (const fileHash of issuedHashes) {
                    const [isValid, issuer, receiver, metadata] = await contract.verifyCredential(fileHash);
                    const details = await contract.getCredentialDetails(fileHash, []);
                    const revokedFields = await contract.getRevokedFields(fileHash);
                    const status = !isValid ? (details.isDeleted ? 'Deleted' : 'Revoked') : 'Active';

                    creds.push({
                        fileHash: fileHash,
                        receiver: receiver,
                        metadata: metadata,
                        status: status,
                        timestamp: Number(details.timestamp) * 1000,
                        revokedFields: revokedFields,
                    });
                }

                setCredentials(creds);
            } catch (error) {
                console.error('Error fetching credentials:', error);
                setNotification({ type: 'error', message: 'Failed to fetch issued credentials' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCredentials();
    }, [walletAddress, provider]);

    const addField = () => {
        setFields([...fields, { key: '', value: '', isMandatory: false }]);
    };

    const updateField = (index: number, type: 'key' | 'value' | 'isMandatory', value: string | boolean) => {
        const updatedFields = fields.map((field, i) =>
            i === index ? { ...field, [type]: value } : field
        );
        setFields(updatedFields);
    };

    const removeField = (index: number) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    const handleIssueCredential = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidReceiver || !provider || !walletAddress || fields.some(f => !f.key || !f.value)) {
            setNotification({ type: 'error', message: 'Please fill all fields and provide a valid receiver address' });
            return;
        }

        setIsSubmitting(true);
        setNotification(null);

        try {
            const metadataObj = fields.reduce((acc, field) => {
                acc[field.key] = field.value;
                return acc;
            }, {} as Record<string, string>);
            const metadata = JSON.stringify(metadataObj);

            const mandatoryFields = fields.filter(f => f.isMandatory).map(f => f.key);
            const mandatoryFieldsJson = JSON.stringify({ fields: mandatoryFields });

            const fileContent = JSON.stringify(metadataObj, null, 2);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const formData = new FormData();
            formData.append('file', blob, 'credential.json');

            const ipfsResponse = await fetch('http://localhost:5000/api/upload-to-ipfs', {
                method: 'POST',
                body: formData,
            });

            if (!ipfsResponse.ok) {
                throw new Error('Failed to upload to IPFS');
            }

            const ipfsData = await ipfsResponse.json();
            const ipfsHash = ipfsData.ipfsHash;

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            console.log("Issuing credential with values:", {
                ipfsHash,
                receiverAddress,
                metadata,
                mandatoryFieldsJson
            });
            

            const tx = await contract.issueCredential(
                ipfsHash,
                receiverAddress,
                metadata,
                mandatoryFieldsJson,
            );

            


            setNotification({
                type: 'success',
                message: 'Transaction submitted. Waiting for confirmation...',
                txHash: tx.hash,
            });

            await tx.wait();

            setNotification({
                type: 'success',
                message: 'Credential issued successfully!',
                txHash: tx.hash,
            });

            setFields([{ key: '', value: '', isMandatory: false }]);
            setReceiverAddress('');

            const [isValid, , receiver, meta] = await contract.verifyCredential(ipfsHash);
            const details = await contract.getCredentialDetails(ipfsHash, []);
            const revokedFields = await contract.getRevokedFields(ipfsHash);

            setCredentials(prev => [
                ...prev,
                {
                    fileHash: ipfsHash,
                    receiver: receiver,
                    metadata: meta,
                    status: 'Active',
                    timestamp: Number(details.timestamp) * 1000,
                    revokedFields: revokedFields,
                },
            ]);
        } catch (error) {
            console.error('Error issuing credential:', error);
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to issue credential',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeCredentialField = async (fileHash: string, field: string) => {
        if (!provider || !walletAddress || !field) return;

        setIsSubmitting(true);
        setNotification(null);

        try {
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);

            // Get current credential data
            const [isValid, , receiver, metadata] = await contract.verifyCredential(fileHash);
            let parsedMetadata = JSON.parse(metadata);
            if (!parsedMetadata[field]) {
                throw new Error(`Field "${field}" does not exist in metadata`);
            }

            // Remove the field from metadata
            delete parsedMetadata[field];
            const updatedMetadata = JSON.stringify(parsedMetadata);

            // Upload updated metadata to IPFS
            const fileContent = JSON.stringify(parsedMetadata, null, 2);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const formData = new FormData();
            formData.append('file', blob, 'credential.json');

            const ipfsResponse = await fetch('http://localhost:5000/api/upload-to-ipfs', {
                method: 'POST',
                body: formData,
            });

            if (!ipfsResponse.ok) {
                throw new Error('Failed to upload updated metadata to IPFS');
            }

            const ipfsData = await ipfsResponse.json();
            const newIpfsHash = ipfsData.ipfsHash;

            // Update contract with new fileHash and metadata
            const tx = await contract.revokeCredentialField(fileHash, newIpfsHash, field, updatedMetadata);

            setNotification({
                type: 'success',
                message: `Revoking field "${field}" and updating file submitted. Waiting for confirmation...`,
                txHash: tx.hash,
            });

            await tx.wait();
            
            setNotification({
                type: 'success',
                message: `Field "${field}" revoked and file updated successfully!`,
                txHash: tx.hash,
            });
            refreshFiles();

            // Update local state
            setCredentials(prev =>
                prev.map(cred => {
                    if (cred.fileHash === fileHash) {
                        return {
                            ...cred,
                            fileHash: newIpfsHash,
                            metadata: updatedMetadata,
                            revokedFields: [...cred.revokedFields, field],
                        };
                    }
                    return cred;
                })
            );
            setRevokeField('');
        } catch (error) {
            console.error('Error revoking credential field:', error);
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to revoke field',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeCredential = async (fileHash: string) => {
        if (!provider || !walletAddress) return;

        setIsSubmitting(true);
        setNotification(null);

        try {
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            const tx = await contract.revokeCredential(fileHash);

            setNotification({
                type: 'success',
                message: 'Full revocation submitted. Waiting for confirmation...',
                txHash: tx.hash,
            });

            await tx.wait();

            setNotification({
                type: 'success',
                message: 'Credential fully revoked successfully!',
                txHash: tx.hash,
            });
            refreshFiles();

            setCredentials(prev =>
                prev.map(cred =>
                    cred.fileHash === fileHash ? { ...cred, status: 'Revoked' } : cred
                )
            );
        } catch (error) {
            console.error('Error revoking credential:', error);
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to revoke credential',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    if (!walletAddress) {
        return (
            <div className="page-transition pt-16">
                <section className="py-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                            Issuer Dashboard
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Please connect your wallet to access the issuer dashboard.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="page-transition pt-16">
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

            <section className="py-12 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {notification && (
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
                    )}

                    <div className="card mb-12">
                        <h2 className="text-2xl font-bold mb-6">Issue New Credential</h2>
                        <form onSubmit={handleIssueCredential} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Credential Fields
                                </label>
                                {fields.map((field, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Field Name (e.g., Name)"
                                            value={field.key}
                                            onChange={(e) => updateField(index, 'key', e.target.value)}
                                            className="input-field flex-1"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value (e.g., John Doe)"
                                            value={field.value}
                                            onChange={(e) => updateField(index, 'value', e.target.value)}
                                            className="input-field flex-1"
                                            required
                                        />
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={field.isMandatory}
                                                onChange={(e) => updateField(index, 'isMandatory', e.target.checked)}
                                                className="mr-2"
                                            />
                                            Mandatory
                                        </label>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeField(index)}
                                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="mt-2 flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                                >
                                    <Plus className="w-5 h-5 mr-1" />
                                    Add Field
                                </button>
                            </div>

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

                            <button
                                type="submit"
                                disabled={isSubmitting || !isValidReceiver || fields.some(f => !f.key || !f.value)}
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
                        </form>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-bold mb-6">Issued Credentials</h2>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : credentials.length === 0 ? (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No credentials issued yet
                            </p>
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
                                                parsedMetadata = { error: "Invalid JSON" };
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
                                                            {credential.revokedFields.length > 0 ? credential.revokedFields.join(', ') : 'None'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${credential.status === 'Active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : credential.status === 'Revoked'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                            }`}>
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
                                                            className={`p-2 rounded-full transition-colors ${credential.status === 'Active' && !isSubmitting && revokeField
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
                                                            className={`p-2 rounded-full transition-colors ${credential.status === 'Active' && !isSubmitting
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
                </div>
            </section>
        </div>
    );
}