import { ShareCredentialModal } from './ShareCredentialModal';

interface DocumentModalProps {
    selectedDoc: any; // Replace 'any' with the appropriate type
    onClose: () => void;
    shareRecipient: string;
    setShareRecipient: (recipient: string) => void;
    selectedFields: string[]; // Explicitly define the type for selectedFields
    setSelectedFields: (fields: string[]) => void;
    shareDuration: number;
    setShareDuration: (duration: number) => void;
    availableFields: string[];
    handleShareCredential: () => void;
    provider: any; // Replace 'any' with the appropriate type
    walletAddress: string;
    notification: string;
    setNotification: (notification: string) => void;
}

export function DocumentModal({
    selectedDoc,
    onClose,
    shareRecipient,
    setShareRecipient,
    selectedFields,
    setSelectedFields,
    shareDuration,
    setShareDuration,
    availableFields,
    handleShareCredential,
    provider,
    walletAddress,
    notification,
    setNotification,
}: DocumentModalProps) {
    return (
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
                                    <p>
                                        <strong>Shared With:</strong>
                                        <span className="break-all block">{selectedDoc.recipient}</span>
                                    </p>
                                    <p>
                                        <strong>Shared On:</strong> {new Date(selectedDoc.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p>
                                        <strong>Expires:</strong>{' '}
                                        {selectedDoc.expiration
                                            ? new Date(selectedDoc.expiration).toLocaleString()
                                            : 'Never'}
                                    </p>
                                    <p>
                                        <strong>Status:</strong>
                                        <span
                                            className={`ml-2 px-2 py-1 rounded ${selectedDoc.expiration && selectedDoc.expiration < Date.now()
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {selectedDoc.expiration && selectedDoc.expiration < Date.now() ? 'Expired' : 'Active'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p>
                                    <strong>Allowed Fields:</strong>
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedDoc.allowedFields?.map((field:string) => (
                                        <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p>
                                    <strong>Revoked Fields:</strong>
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedDoc.revokedFieldKeys?.length > 0 ? (
                                        selectedDoc.revokedFieldKeys.map((field) => (
                                            <span key={field} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
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
                        <p>
                            <strong>File Name:</strong> {selectedDoc.filename}
                        </p>
                        <p>
                            <strong>IPFS Hash:</strong> {selectedDoc.fileHash}
                        </p>
                        <p>
                            <strong>Status:</strong> {selectedDoc.status}
                        </p>
                        <p>
                            <strong>Last Modified:</strong> {new Date(selectedDoc.timestamp).toLocaleString()}
                        </p>
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

                {selectedDoc.filename === 'ISSUED CREDENTIAL' && (
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

                <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}