import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info.jsx';

export function useUserFiles(walletAddress: string, provider: any) {
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [issuedDocuments, setIssuedDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUserFiles = async () => {
            if (!walletAddress || !provider) return;
            setIsLoading(true);
            try {
                const signer = await provider.getSigner();
                const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
                const metadataCIDs = await contract.getUserFiles(walletAddress);

                const uploadedDocs = [];
                const issuedDocs = [];

                for (const metadataCID of metadataCIDs) {
                    try {
                        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;
                        const response = await fetch(metadataUrl);
                        if (!response.ok) throw new Error(`Failed to fetch metadata from IPFS: ${metadataCID}`);
                        const metadata = await response.json();

                        const { fileHash, fileName, timestamp } = metadata;
                        const [isValid] = await contract.verifyCredential(metadataCID);
                        const details = await contract.getCredentialDetails(metadataCID, []);
                        const status = !isValid ? (details.isDeleted ? 'Deleted' : 'Revoked') : 'Active';

                        const documentData = {
                            fileHash: fileHash || metadataCID,
                            filename: fileName || 'ISSUED CREDENTIAL',
                            metadataCID: metadataCID,
                            timestamp: timestamp ? Number(timestamp) * 1000 : Date.now(),
                            status: status,
                            url: `https://gateway.pinata.cloud/ipfs/${fileHash || metadataCID}`,
                        };

                        if (fileHash === undefined && fileName === undefined) {
                            issuedDocs.push(documentData);
                        } else {
                            uploadedDocs.push(documentData);
                        }
                    } catch (innerError) {
                        console.warn(`Skipping metadataCID ${metadataCID} due to error:`, innerError);
                        continue;
                    }
                }

                setUploadedDocuments(uploadedDocs);
                setIssuedDocuments(issuedDocs);
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserFiles();
    }, [walletAddress, provider]);

    return { uploadedDocuments, issuedDocuments, isLoading };
}