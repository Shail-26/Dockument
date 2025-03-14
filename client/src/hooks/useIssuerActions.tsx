// src/hooks/useIssuerActions.ts
import { useState } from 'react';
import { Contract, ethers } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info';
import { Credential, FormField, NotificationType } from '../types';

export const useIssuerActions = (walletAddress: string, provider: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [revokeField, setRevokeField] = useState<string>('');

    const handleIssueCredential = async (fields: FormField[], receiverAddress: string) => {
        if (!provider || !walletAddress || fields.some(f => !f.key || !f.value)) {
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

            // Prepare metadata file for IPFS
            const fileContent = JSON.stringify(metadataObj, null, 2);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const formData = new FormData();
            formData.append('file', blob, 'credential.json');

            // Upload metadata to IPFS
            const ipfsResponse = await fetch('http://localhost:5000/api/upload-to-ipfs', {
                method: 'POST',
                body: formData,
            });

            if (!ipfsResponse.ok) {
                throw new Error('Failed to upload metadata to IPFS');
            }

            const ipfsData = await ipfsResponse.json();
            const metadataCID = ipfsData.metadataCID;

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);

            if (!contract || !contract.issueCredential) {
                throw new Error("Smart contract is not properly initialized.");
            }

            const tx = await contract.issueCredential(
                metadataCID,
                receiverAddress,
                metadata,
                mandatoryFieldsJson
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

            // Fetch updated credential details
            const verifyData = await contract.verifyCredential(metadataCID);
            const [isValid, , receiver, meta] = verifyData || [false, "", "", ""];

            const details = await contract.getCredentialDetails(metadataCID, []);
            if (!details || !details.timestamp) {
                throw new Error("getCredentialDetails returned invalid data.");
            }

            const revokedFields = await contract.getRevokedFields(metadataCID);

            setCredentials(prev => [
                ...prev,
                {
                    metadataCID: metadataCID,
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

    const handleRevokeCredentialField = async (metadataCID: string, field: string) => {
        if (!provider || !walletAddress || !field) return;

        setIsSubmitting(true);
        setNotification(null);

        try {
            const metadataResponse = await fetch(`https://ipfs.io/ipfs/${metadataCID}`);
            if (!metadataResponse.ok) {
                throw new Error(`Failed to fetch metadata from IPFS. Status: ${metadataResponse.status}`);
            }

            const metadataText = await metadataResponse.text();
            if (!metadataText) {
                throw new Error("Metadata response from IPFS is empty.");
            }

            const metadataJson = JSON.parse(metadataText);
            const fileHash = metadataJson.fileHash;
            if (!fileHash) {
                throw new Error("File hash not found in metadata.");
            }

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            const [isValid, , receiver, metadata] = await contract.verifyCredential(fileHash);

            if (!metadata || metadata.trim() === "") {
                throw new Error("Metadata from blockchain is empty.");
            }

            let parsedMetadata;
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (jsonError) {
                throw new Error(`Failed to parse metadata from blockchain. Raw Response: ${metadata}`);
            }

            if (!parsedMetadata[field]) {
                throw new Error(`Field "${field}" does not exist in metadata`);
            }

            delete parsedMetadata[field];
            const updatedMetadata = JSON.stringify(parsedMetadata, null, 2);

            const blob = new Blob([updatedMetadata], { type: 'application/json' });
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
            if (!newIpfsHash) {
                throw new Error("New IPFS hash is missing from the response.");
            }

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

            setCredentials(prev =>
                prev.map(cred => {
                    if (cred.metadataCID === metadataCID) {
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

            setCredentials(prev =>
                prev.map(cred =>
                    cred.metadataCID === fileHash ? { ...cred, status: 'Revoked' } : cred
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
                    metadataCID: fileHash,
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

    return {
        isSubmitting,
        notification,
        credentials,
        isLoading,
        handleIssueCredential,
        handleRevokeCredentialField,
        handleRevokeCredential,
        fetchCredentials,
        setNotification,
    };
};
