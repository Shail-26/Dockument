import { useState, useEffect } from 'react';
import { Grid, List, Trash2, FileText } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { Contract } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info.jsx';
import { NotificationType } from '../types.js';
import { NotificationBanner } from '../components/issuer/NotificationBanner.js';
import { ShareCredentialModal } from '../components/ShareCredentialModal'; // Adjust path based on file location

interface Document {
    revokedFieldKeys?: any;
    fileHash: string;
    filename: string;
    metadataCID?: string;
    timestamp: number;
    status: 'Active' | 'Revoked' | 'Deleted' | 'Shared';
    url: string;
    allowedFields?: string[]; // Optional for shared documents
    expiration?: number; // Optional for shared documents
    filteredMetadata?: { [key: string]: any }; // Optional for shared documents
    recipient?: string;
}

export function MyDocuments() {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [issuedDocuments, setIssuedDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const { walletAddress, provider, refreshFiles } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
    const [sharedByOwner, setSharedByOwner] = useState<Document[]>([]);
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [shareRecipient, setShareRecipient] = useState("");
    const [selectedFields, setSelectedFields] = useState<string[]>([]); // Replaced shareFields
    const [shareDuration, setShareDuration] = useState(0);
    // const [shareFields, setShareFields] = useState("");
    // const [showCertificate, setShowCertificate] = useState(false); // New state for certificate view
    // const [certificateData, setCertificateData] = useState<{ [key: string]: any } | null>(null); // New state for certificate data

    useEffect(() => {
        if (walletAddress && provider) {
            fetchUserFiles();
            fetchSharedDocuments();
            fetchSharedByOwner();
        }
    }, [walletAddress, provider, refreshFiles]);


    useEffect(() => {
        const fetchAvailableFields = async () => {
            if (!selectedDoc || !provider || selectedDoc.filename !== "ISSUED CREDENTIAL") {
                setAvailableFields([]);
                setSelectedFields([]);
                return;
            }

            try {
                const signer = await provider.getSigner();
                const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
                const metadataUrl = `https://gateway.pinata.cloud/ipfs/${selectedDoc.fileHash}`;
                const response = await fetch(metadataUrl);

                if (response.ok) {
                    const metadata = await response.json();
                    // Assuming metadata is an object like { name: "Alice", type: "Certificate", course: "Math" }
                    const fields = Object.keys(metadata).filter(key => key !== "fileHash" && key !== "fileName" && key !== "timestamp");
                    setAvailableFields(fields);
                } else {
                    // Fallback: Use contract's mandatoryFields or a default list if metadata fetch fails
                    const mandatoryFields = await contract.getMandatoryFields(selectedDoc.fileHash);
                    const parsedFields = JSON.parse(mandatoryFields).fields || ["name", "type", "course"];
                    setAvailableFields(parsedFields);
                }
            } catch (error) {
                console.error("Error fetching available fields:", error);
                // Default fields as fallback
                setAvailableFields(["name", "type", "course"]);
            }
            setSelectedFields([]); // Reset selected fields when a new document is selected
        };

        fetchAvailableFields();
    }, [selectedDoc, provider]);

    useEffect(() => {
        if (sharedDocuments.length > 0) {
            const validShared = sharedDocuments.filter(doc => doc.expiration && doc.expiration > Date.now());
            if (validShared.length !== sharedDocuments.length) {
                setSharedDocuments(validShared);
            }
        }
    }, [sharedDocuments]);


    // Function to fetch shared credentials for the current wallet
    const fetchSharedDocuments = async () => {
        try {
            if (!provider || !walletAddress) return;
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            // Assume getSharedCredentials() returns an array of shared access objects
            const sharedData = await contract.getSharedCredentials();
            console.log("Shared credentials:", sharedData);

            const sharedDocs = await Promise.all(sharedData.map(async (share: any) => {
                // Assume share.fileHash is used as metadataCID for shared credentials.
                const metadataUrl = `https://gateway.pinata.cloud/ipfs/${share.fileHash}`;
                let fullMetadata: { [key: string]: any } = {};
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

                // Filter metadata: only keep keys that are allowed
                let filteredMetadata: { [key: string]: any } = {};
                if (share.allowedFields && share.allowedFields.length > 0) {
                    share.allowedFields.forEach((field: string) => {
                        if (fullMetadata[field] !== undefined) {
                            filteredMetadata[field] = fullMetadata[field];
                        }
                    });
                }

                return {
                    fileHash: share.fileHash,
                    filename: "Shared Document",
                    metadataCID: share.fileHash,
                    timestamp: share.expiration ? Number(share.expiration) * 1000 : Date.now(),
                    status: "Shared",
                    url: `https://gateway.pinata.cloud/ipfs/${share.fileHash}`,
                    allowedFields: share.allowedFields,
                    expiration: share.expiration ? Number(share.expiration) * 1000 : Date.now(),
                    filteredMetadata, // New property: contains only the allowed fields
                };
            }));
            setSharedDocuments(sharedDocs);
            console.log("Shared documents:", sharedDocs);
        } catch (error) {
            console.error("Error fetching shared credentials:", error);
        }
    };

    const fetchSharedByOwner = async () => {
        try {
            if (!provider || !walletAddress) {
                return;
            }
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            const sharedData = await contract.getSharedByOwner();
            console.log("Shared by owner credentials:", sharedData);

            const sharedDocs = await Promise.all(sharedData.map(async (share: any) => {
                const metadataUrl = `https://gateway.pinata.cloud/ipfs/${share.fileHash}`;
                let fullMetadata: { [key: string]: any } = {};
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
                    filename: fullMetadata.fileName || "Shared Credential",
                    metadataCID: share.fileHash,
                    timestamp: fullMetadata.timestamp ? Number(fullMetadata.timestamp) * 1000 : Date.now(),
                    status: "Shared",
                    url: `https://gateway.pinata.cloud/ipfs/${share.fileHash}`,
                    allowedFields: share.allowedFields,
                    expiration: share.expiration ? Number(share.expiration) * 1000 : Date.now(),
                    recipient: share.recipient,
                };
            }));
            setSharedByOwner(sharedDocs);
            console.log("Shared by owner documents:", sharedDocs);

        } catch (err) {
            console.error("Error fetching shared by owner credentials:", err);
        }
    }

    const renderSharedByOwner = (documents: Document[]) => {
        // Filter documents into active and expired
        const activeDocs = documents.filter(doc => doc.expiration && doc.expiration > Date.now());
        const expiredDocs = documents.filter(doc => doc.expiration && doc.expiration <= Date.now());

        return (
            <div className="mb-12">
                {/* Active Shared Credentials Section */}
                <h2 className="text-2xl font-bold mb-4">Shared By Me</h2>
                <h3 className="text-xl font-semibold mb-2">Active</h3>
                {activeDocs.length === 0 ? (
                    <p className="text-gray-500 mb-6">No active credentials shared by you</p>
                ) : viewType === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        {activeDocs.map((doc) => (
                            <div
                                key={doc.fileHash + doc.recipient}
                                className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <FileText className="w-6 h-6" />
                                <p className="font-medium truncate">{doc.filename}</p>
                                <p className="text-gray-500 break-all">Shared with: <span className="break-all">{doc.recipient}</span></p>
                                <p className="text-gray-500">Expires: {doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</p>
                                <p className="text-sm text-green-600">Active</p>
                            </div>
                        ))}
                    </div>

                ) : (
                    <table className="w-full mb-8">
                        <thead>
                            <tr>
                                <th className="pb-3 text-left">File</th>
                                <th className="pb-3 text-left">Shared With</th>
                                <th className="pb-3 text-left">Expires</th>
                                <th className="pb-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeDocs.map((doc) => (
                                <tr
                                    key={doc.fileHash + doc.recipient}
                                    onClick={() => setSelectedDoc(doc)}
                                    className="hover:bg-gray-100"
                                >
                                    <td className="py-4">{doc.filename}</td>
                                    <td className="py-4">{doc.recipient}</td>
                                    <td className="py-4">{doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</td>
                                    <td className="py-4 text-sm font-medium text-green-600">Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Expired Shared Credentials Section */}
                <h3 className="text-xl font-semibold mb-2">Expired</h3>
                {expiredDocs.length === 0 ? (
                    <p className="text-gray-500">No expired credentials shared by you</p>
                ) : viewType === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {expiredDocs.map((doc) => (
                            <div
                                key={doc.fileHash + doc.recipient}
                                className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <FileText className="w-6 h-6" />
                                <p className="font-medium truncate">{doc.filename}</p>
                                <p className="text-gray-500 break-all">Shared with: {doc.recipient}</p>
                                <p className="text-gray-500">Expired: {doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</p>
                                <p className="text-sm text-red-600">Expired</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="pb-3 text-left">File</th>
                                <th className="pb-3 text-left">Shared With</th>
                                <th className="pb-3 text-left">Expired</th>
                                <th className="pb-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiredDocs.map((doc) => (
                                <tr
                                    key={doc.fileHash + doc.recipient}
                                    onClick={() => setSelectedDoc(doc)}
                                    className="hover:bg-gray-100"
                                >
                                    <td className="py-4">{doc.filename}</td>
                                    <td className="py-4">{doc.recipient}</td>
                                    <td className="py-4">{doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</td>
                                    <td className="py-4 text-sm font-medium text-red-600">Expired</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    const fetchUserFiles = async () => {
        setIsLoading(true);
        try {
            if (!provider) throw new Error('Provider not available');
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            const metadataCIDs = await contract.getUserFiles(walletAddress);

            const uploadedDocs: Document[] = [];
            const issuedDocs: Document[] = [];

            for (const metadataCID of metadataCIDs) {
                try {
                    const metadataUrl = `https://ipfs.io/ipfs/${metadataCID}`;
                    const response = await fetch(metadataUrl);
                    if (!response.ok) throw new Error(`Failed to fetch metadata from IPFS: ${metadataCID}`);
                    const metadata = await response.json();

                    const { fileHash, fileName, timestamp } = metadata;
                    const [isValid] = await contract.verifyCredential(metadataCID);
                    const details = await contract.getCredentialDetails(metadataCID, []);
                    const status = (!isValid ? (details.isDeleted ? "Deleted" : "Revoked") : "Active") as "Active" | "Revoked" | "Deleted";

                    const documentData = {
                        fileHash: fileHash || metadataCID,
                        filename: fileName || "ISSUED CREDENTIAL",
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
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!window.confirm(`Are you sure you want to delete this document (${doc.fileHash})?`)) return;

        try {
            if (!provider) throw new Error('Provider not available');
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
            const tx = await contract.deleteFile(doc.metadataCID);

            console.log('Transaction submitted:', tx.hash);
            await tx.wait();

            setUploadedDocuments(prevDocs => prevDocs.filter(d => d.fileHash !== doc.fileHash));
            console.log('Deleted successfully:', doc.fileHash);
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const handleShareCredential = async () => {
        if (!provider || !walletAddress || !selectedDoc) return;
        try {

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);

            const existingShare = sharedByOwner.find(
                (doc) =>
                    doc.fileHash === selectedDoc.fileHash &&
                    doc.recipient === shareRecipient &&
                    doc.expiration && doc.expiration > Date.now()
            );

            // Call shareCredential function on the contract
            if (existingShare) {
                // Compare selectedFields with existing allowedFields
                const existingFields = existingShare.allowedFields || [];
                const fieldsAreIdentical =
                    selectedFields.length === existingFields.length &&
                    selectedFields.every((field) => existingFields.includes(field)) &&
                    existingFields.every((field) => selectedFields.includes(field));

                if (fieldsAreIdentical) {
                    // Fields are the same, show error
                    setNotification({
                        type: "error",
                        message: "This credential is already shared with this recipient with the same fields.",
                    });
                    return;
                } else {
                    // Fields differ, modify the existing share by adding new fields
                    const updatedFields = [...new Set([...existingFields, ...selectedFields])]; // Merge and remove duplicates

                    // Here, we assume the contract overwrites the existing share with new fields
                    // If your contract doesn't support modification, you'd need to revoke and re-share
                    const tx = await contract.shareCredential(
                        selectedDoc.fileHash,
                        shareRecipient,
                        updatedFields,
                        shareDuration // Use new duration or keep existing one (adjust as needed)
                    );
                    console.log("Modify share transaction submitted:", tx.hash);
                    setNotification({
                        type: "success",
                        message: "Sharing modified with new fields! Waiting for confirmation...",
                        txHash: tx.hash,
                    });
                    await tx.wait();
                    setNotification({
                        type: "success",
                        message: "Sharing modified successfully!",
                        txHash: tx.hash,
                    });
                }
            } else {
                // No active share exists, proceed with a new share
                const tx = await contract.shareCredential(
                    selectedDoc.fileHash,
                    shareRecipient,
                    selectedFields,
                    shareDuration
                );
                console.log("Share transaction submitted:", tx.hash);
                setNotification({
                    type: "success",
                    message: "Credential shared successfully! Waiting for confirmation...",
                    txHash: tx.hash,
                });
                await tx.wait();
                setNotification({
                    type: "success",
                    message: "Credential shared successfully!",
                    txHash: tx.hash,
                });
            }
            // Optionally refresh shared credentials from the contract here
            fetchSharedByOwner(); // Refresh "Shared By Me"
            setShareRecipient("");
            setSelectedFields([]);
            setShareDuration(0);
        } catch (error) {
            console.error("Error sharing credential:", error);
            setNotification({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to share credential",
            });
        } finally {
            setTimeout(() => setNotification(null), 5000);
            setSelectedDoc(null);
        }
    };

    const renderSharedDocuments = (documents: Document[]) => {
        // Filter out expired shared documents
        const validDocs = documents.filter(doc => doc.expiration && doc.expiration > Date.now());

        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Shared With Me</h2>
                {validDocs.length === 0 ? (
                    <p className="text-gray-500">No shared credentials found</p>
                ) : viewType === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {validDocs.map((doc) => (
                            <div key={doc.fileHash} className="card p-4 border rounded cursor-pointer hover:shadow-lg" onClick={() => setSelectedDoc(doc)}>
                                <FileText className="w-6 h-6" />
                                <p className="font-medium truncate">{doc.filename}</p>
                                <p className="text-gray-500">Expires: {doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</p>
                                <p className="text-sm text-blue-600">Shared Access</p>
                                {doc.filteredMetadata && (
                                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded border">
                                        {Object.entries(doc.filteredMetadata).map(([key, value]) => (
                                            <p key={key}><strong className="capitalize">{key}:</strong> {value}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="pb-3 text-left">File</th>
                                <th className="pb-3 text-left">Expires</th>
                                <th className="pb-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {validDocs.map((doc) => (
                                <tr key={doc.fileHash} onClick={() => setSelectedDoc(doc)} className="hover:bg-gray-100">
                                    <td className="py-4">{doc.filename}</td>
                                    <td className="py-4">{doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</td>
                                    <td className="py-4 text-sm font-medium">Shared Access</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    const renderDocumentList = (documents: Document[], title: string) => (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {documents.length === 0 ? (
                <p className="text-gray-500">No {title.toLowerCase()} found</p>
            ) : viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div key={doc.fileHash} className="card p-4 border rounded cursor-pointer hover:shadow-lg" onClick={() => setSelectedDoc(doc)}>
                            <FileText className="w-6 h-6" />
                            <p className="font-medium truncate">{doc.filename}</p>
                            <p className="text-gray-500">Modified: {new Date(doc.timestamp).toLocaleString()}</p>
                            <p className={`text-sm ${doc.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{doc.status}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="pb-3 text-left">File</th>
                            <th className="pb-3 text-left">Modified</th>
                            <th className="pb-3 text-left">Status</th>
                            <th className="pb-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.fileHash} onClick={() => setSelectedDoc(doc)} className="hover:bg-gray-100">
                                <td className="py-4">{doc.filename}</td>
                                <td className="py-4">{new Date(doc.timestamp).toLocaleString()}</td>
                                <td className="py-4 text-sm font-medium">{doc.status}</td>
                                <td className="py-4">
                                    {/* Hide delete button for shared documents */}
                                    {doc.status !== 'Shared' && (
                                        <button
                                            title="Delete Document"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={doc.status !== 'Active'}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="page-transition pt-16">
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center">My Documents</h1>
                    <p className="text-center">Manage all your secure documents in one place</p>
                </div>
            </section>

            <section className="py-12 bg-white">

                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between mb-8">
                        <button title="Grid View" onClick={() => setViewType('grid')} className="p-2 rounded-lg bg-gray-100"><Grid className="w-5 h-5" /></button>
                        <button title="List View" onClick={() => setViewType('list')} className="p-2 rounded-lg bg-gray-100"><List className="w-5 h-5" /></button>
                    </div>
                    <NotificationBanner notification={notification} />
                    {isLoading ?
                        <div className="flex justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div> : (
                            <>
                                {renderDocumentList(uploadedDocuments, "Uploaded Files")}
                                {renderDocumentList(issuedDocuments, "Issued Credentials")}
                                {renderSharedDocuments(sharedDocuments)}
                                {renderSharedByOwner(sharedByOwner)}
                            </>
                        )}
                </div>
            </section>

            {selectedDoc && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
                        <h3 className="text-xl font-bold mb-4">Document Preview</h3>
                        {selectedDoc.recipient ? (
                            <div>
                                <div className="mb-4">
                                    <p className="font-semibold">Credential: {selectedDoc.filename}</p>
                                    <p className="text-sm text-gray-600 break-all">IPFS Hash: {selectedDoc.fileHash}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-lg font-semibold mb-2">Sharing Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p><strong>Shared With:</strong>
                                                <span className="break-all block">{selectedDoc.recipient}</span>
                                            </p>
                                            <p><strong>Shared On:</strong>
                                                {new Date(selectedDoc.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p><strong>Expires:</strong>
                                                {selectedDoc.expiration ?
                                                    new Date(selectedDoc.expiration).toLocaleString() :
                                                    'Never'}
                                            </p>
                                            <p><strong>Status:</strong>
                                                <span className={`ml-2 px-2 py-1 rounded ${selectedDoc.expiration && selectedDoc.expiration < Date.now() ?
                                                    'bg-red-100 text-red-800' :
                                                    'bg-green-100 text-green-800'
                                                    }`}>
                                                    {selectedDoc.expiration && selectedDoc.expiration < Date.now() ?
                                                        'Expired' : 'Active'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p><strong>Allowed Fields:</strong></p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {selectedDoc.allowedFields?.map(field => (
                                                <span
                                                    key={field}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                                >
                                                    {field}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p><strong>Revoked Fields:</strong></p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {selectedDoc.revokedFieldKeys?.length > 0 ? (
                                                selectedDoc.revokedFieldKeys.map((field:string) => (
                                                    <span
                                                        key={field}
                                                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                                                    >
                                                        {field}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">No fields revoked</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : selectedDoc.status === 'Shared' ? (
                            // For shared documents, check if access is still valid.
                            Date.now() < (selectedDoc.expiration || 0) ? (
                                <div>
                                    <p className="text-lg font-semibold mb-2">Shared Credential Details</p>
                                    {/* Render only the filtered metadata for shared credentials */}
                                    {selectedDoc.filteredMetadata ? (
                                        Object.entries(selectedDoc.filteredMetadata).map(([key, value]) => (
                                            <p key={key}>
                                                <strong className="capitalize">{key}:</strong> {value}
                                            </p>
                                        ))
                                    ) : (
                                        <p>No shared details available.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-red-500 font-bold">Shared access has expired.</p>
                            )
                        ) : (
                            // For non-shared documents, display full details
                            <div>
                                <p><strong>File Name:</strong> {selectedDoc.filename}</p>
                                <p><strong>IPFS Hash:</strong> {selectedDoc.fileHash}</p>
                                <p><strong>Status:</strong> {selectedDoc.status}</p>
                                <p><strong>Last Modified:</strong> {new Date(selectedDoc.timestamp).toLocaleString()}</p>
                                <div className="mt-4">
                                    <a
                                        href={selectedDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline font-semibold"
                                    >
                                        Open Document in New Tab
                                    </a>
                                </div>
                            </div>
                        )}

                        {selectedDoc && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
                                    <h3 className="text-xl font-bold mb-4">Document Preview</h3>
                                    {selectedDoc.recipient ? (
                                        <div>
                                            <div className="mb-4">
                                                <p className="font-semibold">Credential: {selectedDoc.filename}</p>
                                                <p className="text-sm text-gray-600 break-all">IPFS Hash: {selectedDoc.fileHash}</p>
                                            </div>
                                            <div className="border-t pt-4">
                                                <h4 className="text-lg font-semibold mb-2">Sharing Details</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p><strong>Shared With:</strong>
                                                            <span className="break-all block">{selectedDoc.recipient}</span>
                                                        </p>
                                                        <p><strong>Shared On:</strong>
                                                            {new Date(selectedDoc.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p><strong>Expires:</strong>
                                                            {selectedDoc.expiration ?
                                                                new Date(selectedDoc.expiration).toLocaleString() :
                                                                'Never'}
                                                        </p>
                                                        <p><strong>Status:</strong>
                                                            <span className={`ml-2 px-2 py-1 rounded ${selectedDoc.expiration && selectedDoc.expiration < Date.now() ?
                                                                'bg-red-100 text-red-800' :
                                                                'bg-green-100 text-green-800'
                                                                }`}>
                                                                {selectedDoc.expiration && selectedDoc.expiration < Date.now() ?
                                                                    'Expired' : 'Active'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <p><strong>Allowed Fields:</strong></p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedDoc.allowedFields?.map(field => (
                                                            <span
                                                                key={field}
                                                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                                            >
                                                                {field}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <p><strong>Revoked Fields:</strong></p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedDoc.revokedFieldKeys?.length > 0 ? (
                                                            selectedDoc.revokedFieldKeys.map((field:string) => (
                                                                <span
                                                                    key={field}
                                                                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                                                                >
                                                                    {field}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <p className="text-gray-500">No fields revoked</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedDoc.status === 'Shared' ? (
                                        Date.now() < (selectedDoc.expiration || 0) ? (
                                            <div>
                                                <p className="text-lg font-semibold mb-2">Shared Credential Details</p>
                                                {selectedDoc.filteredMetadata ? (
                                                    Object.entries(selectedDoc.filteredMetadata).map(([key, value]) => (
                                                        <p key={key}>
                                                            <strong className="capitalize">{key}:</strong> {value}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p>No shared details available.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-red-500 font-bold">Shared access has expired.</p>
                                        )
                                    ) : (
                                        <div>
                                            <p><strong>File Name:</strong> {selectedDoc.filename}</p>
                                            <p><strong>IPFS Hash:</strong> {selectedDoc.fileHash}</p>
                                            <p><strong>Status:</strong> {selectedDoc.status}</p>
                                            <p><strong>Last Modified:</strong> {new Date(selectedDoc.timestamp).toLocaleString()}</p>
                                            <div className="mt-4">
                                                <a
                                                    href={selectedDoc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline font-semibold"
                                                >
                                                    Open Document in New Tab
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Use the new component here */}
                                    {selectedDoc.filename === "ISSUED CREDENTIAL" && (
                                        <ShareCredentialModal
                                            selectedDoc={selectedDoc}
                                            provider={provider}
                                            shareRecipient={shareRecipient}
                                            setShareRecipient={setShareRecipient}
                                            selectedFields={selectedFields}
                                            setSelectedFields={setSelectedFields}
                                            shareDuration={shareDuration}
                                            setShareDuration={setShareDuration}
                                            availableFields={availableFields}
                                            handleShareCredential={handleShareCredential}
                                        />
                                    )}

                                    <button
                                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                                        onClick={() => setSelectedDoc(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => setSelectedDoc(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}