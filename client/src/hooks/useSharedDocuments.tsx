import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info.jsx';

export function useSharedDocuments(walletAddress: string, provider: any) {
    const [sharedDocuments, setSharedDocuments] = useState([]);

    useEffect(() => {
        const fetchSharedDocuments = async () => {
            if (!walletAddress || !provider) return;
            try {
                const signer = await provider.getSigner();
                const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
                const sharedData = await contract.getSharedCredentials();

                const sharedDocs = await Promise.all(
                    sharedData.map(async (share) => {
                        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${share.fileHash}`;
                        let fullMetadata = {};
                        try {
                            const response = await fetch(metadataUrl);
                            if (response.ok) {
                                fullMetadata = await response.json();
                            } else {
                                console.warn(`Failed to fetch metadata for ${share.fileHash}`);
                            }
                        } catch (err) {
                            console.error(`Error fetching metadata for ${share.fileHash}:`, err);
                        }

                        let filteredMetadata = {};
                        if (share.allowedFields && share.allowedFields.length > 0) {
                            share.allowedFields.forEach((field) => {
                                if (fullMetadata[field] !== undefined) {
                                    filteredMetadata[field] = fullMetadata[field];
                                }
                            });
                        }

                        return {
                            fileHash: share.fileHash,
                            filename: 'Shared Document',
                            metadataCID: share.fileHash,
                            timestamp: share.expiration ? Number(share.expiration) * 1000 : Date.now(),
                            status: 'Shared',
                            url: `https://gateway.pinata.cloud/ipfs/${share.fileHash}`,
                            allowedFields: share.allowedFields,
                            expiration: share.expiration ? Number(share.expiration) * 1000 : Date.now(),
                            filteredMetadata,
                        };
                    })
                );
                setSharedDocuments(sharedDocs.filter((doc) => doc.expiration > Date.now()));
            } catch (error) {
                console.error('Error fetching shared credentials:', error);
            }
        };

        fetchSharedDocuments();
    }, [walletAddress, provider]);

    return { sharedDocuments };
}