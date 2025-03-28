import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info.jsx';

export function useSharedByOwner(walletAddress: string | null, provider: any) {
    const [sharedByOwner, setSharedByOwner] = useState([]);

    useEffect(() => {
        const fetchSharedByOwner = async () => {
            if (!walletAddress || !provider) return;
            try {
                const signer = await provider.getSigner();
                const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
                const sharedData = await contract.getSharedByOwner();

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

                        return {
                            fileHash: share.fileHash,
                            filename: fullMetadata.fileName || 'Shared Credential',
                            metadataCID: share.fileHash,
                            timestamp: fullMetadata.timestamp ? Number(fullMetadata.timestamp) * 1000 : Date.now(),
                            status: 'Shared',
                            url: `https://gateway.pinata.cloud/ipfs/${share.fileHash}`,
                            allowedFields: share.allowedFields,
                            expiration: share.expiration ? Number(share.expiration) * 1000 : Date.now(),
                            recipient: share.recipient,
                        };
                    })
                );
                setSharedByOwner(sharedDocs);
            } catch (error) {
                console.error('Error fetching shared by owner credentials:', error);
            }
        };

        fetchSharedByOwner();
    }, [walletAddress, provider]);

    return { sharedByOwner };
}