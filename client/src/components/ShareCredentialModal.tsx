import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface Document {
    fileHash: string;
    filename: string;
    timestamp: number;
}

interface ShareCredentialModalProps {
    selectedDoc: Document;
    provider: any; // Adjust type based on your ethers setup
    shareRecipient: string;
    setShareRecipient: (value: string) => void;
    selectedFields: string[];
    setSelectedFields: (fields: string[]) => void;
    shareDuration: number;
    setShareDuration: (value: number) => void;
    availableFields: string[];
    handleShareCredential: () => void;
}

export function ShareCredentialModal({
    selectedDoc,
    provider,
    shareRecipient,
    setShareRecipient,
    selectedFields,
    setSelectedFields,
    shareDuration,
    setShareDuration,
    availableFields,
    handleShareCredential,
}: ShareCredentialModalProps) {
    const [showCertificate, setShowCertificate] = useState(false);
    const [certificateData, setCertificateData] = useState<{ [key: string]: any } | null>(null);
    const certificateRef = useRef<HTMLDivElement>(null); 

    const handleDownload = async () => {
        if (certificateRef.current) {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher resolution for better quality
                backgroundColor: null, // Preserve transparency
            });
            const link = document.createElement('a');
            try{
                link.href = canvas.toDataURL('image/png');
                link.download = `${selectedDoc.filename || 'certificate'}.png`;
                link.click();
            } catch(e){
                console.error('Failed to download certificate:', e);
                alert('Failed to download certificate. Please try again.');
            } finally {
                link.remove();
            }
        }
    };

    useEffect(() => {
        const fetchCertificateData = async () => {
            if (!provider) {
                setCertificateData(null);
                return;
            }

            try {
                const metadataUrl = `https://gateway.pinata.cloud/ipfs/${selectedDoc.fileHash}`;
                const response = await fetch(metadataUrl);
                if (response.ok) {
                    const metadata = await response.json();
                    setCertificateData(metadata);
                } else {
                    console.warn(`Failed to fetch metadata for ${selectedDoc.fileHash}`);
                    setCertificateData(null);
                }
            } catch (error) {
                console.error("Error fetching certificate data:", error);
                setCertificateData(null);
            }
        };

        fetchCertificateData();
    }, [selectedDoc, provider]);

    return (
        <div className="mt-6 border-t pt-4">
            <h4 className="text-lg font-semibold mb-2">Share Credential</h4>

            {/* Recipient Address */}
            <div className="mb-2">
                <label className="block text-sm font-medium">Recipient Address</label>
                <input
                    type="text"
                    placeholder="0x..."
                    value={shareRecipient}
                    onChange={(e) => setShareRecipient(e.target.value)}
                    className="mt-1 p-2 border rounded w-full"
                />
            </div>

            {/* Fields to Share (Checkboxes) */}
            <div className="mb-2">
                <label className="block text-sm font-medium mb-2">Fields to Share</label>
                {availableFields.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableFields.map((field) => (
                            <div key={field} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={field}
                                    checked={selectedFields.includes(field)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedFields([...selectedFields, field]);
                                        } else {
                                            setSelectedFields(selectedFields.filter((f) => f !== field));
                                        }
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor={field} className="text-sm capitalize">{field}</label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No fields available to share</p>
                )}
            </div>

            {/* Access Duration */}
            <div className="mb-2">
                <label className="block text-sm font-medium">Access Duration (in seconds)</label>
                <input
                    type="number"
                    placeholder="3600"
                    value={shareDuration}
                    onChange={(e) => setShareDuration(Number(e.target.value))}
                    className="mt-1 p-2 border rounded w-full"
                />
            </div>

            {/* Buttons */}
            <div className="mt-2 flex space-x-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    onClick={handleShareCredential}
                    disabled={!shareRecipient || selectedFields.length === 0 || !shareDuration}
                >
                    Share Credential
                </button>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowCertificate(true)}
                >
                    View Certificate
                </button>
            </div>

            {/* Certificate View Modal */}
            {showCertificate && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-[960px] relative" style={{ minHeight: '512px' }}>
                        <div
                            ref={certificateRef} // Attach ref to the certificate div
                            className="certificate bg-gradient-to-r from-blue-50 to-blue-200 p-10 rounded-lg border-4 border-double border-blue-500 shadow-lg relative"
                            style={{ width: '896px', height: '448px' }} // Fixed landscape dimensions
                        >
                            {/* Corner Accents */}
                            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-600 rounded-tl-lg"></div>
                            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-600 rounded-tr-lg"></div>
                            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-600 rounded-bl-lg"></div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-600 rounded-br-lg"></div>

                            {/* Header */}
                            <h2 className="text-4xl font-extrabold text-center text-blue-900 mb-6 tracking-wide">Certificate</h2>

                            {/* Title Section */}
                            <div className="text-center mb-6">
                                <p className="text-2xl font-semibold text-blue-800 italic">Credential: {selectedDoc.filename}</p>
                                <p className="text-sm text-blue-600 mt-2">IPFS Hash: <span className="font-mono text-blue-500 break-all">{selectedDoc.fileHash}</span></p>
                            </div>

                            {/* Fields Section with Fixed Height */}
                            <div
                                className="border-t-2 border-b-2 border-dashed border-blue-400 py-6 px-6 bg-white bg-opacity-80 rounded-md flex flex-col justify-center"
                                style={{ height: '200px' }} // Fixed height for fields
                            >
                                {certificateData ? (
                                    (() => {
                                        const filteredFields = Object.entries(certificateData)
                                            .filter(([key]) => key !== "fileHash" && key !== "fileName" && key !== "timestamp")
                                            .slice(0, 4); // Max 4 fields
                                        const fieldCount = filteredFields.length;
                                        const gapClass = fieldCount === 1 ? 'gap-8' : fieldCount === 2 ? 'gap-6' : fieldCount === 3 ? 'gap-4' : 'gap-2';

                                        return (
                                            <div className={`flex flex-wrap justify-between ${gapClass}`}>
                                                {filteredFields.map(([key, value]) => (
                                                    <p key={key} className="text-lg text-gray-900 w-1/2 px-4 py-1">
                                                        <strong className="capitalize font-bold text-blue-800">{key}:</strong>{' '}
                                                        <span className="text-blue-700">{value}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-blue-500 text-center italic w-full py-2">Loading certificate data...</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-blue-700">Issued on: <span className="font-semibold text-blue-800">{new Date(selectedDoc.timestamp).toLocaleDateString()}</span></p>
                            </div>

                            {/* Seal/Emblem */}
                            <div className="absolute bottom-4 right-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center opacity-80">
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 0V4m0 16v-4m-8-4h4m12 0h-4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-6 flex space-x-4">
                            <button
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full flex-1 hover:from-blue-600 hover:to-blue-700 transition-colors"
                                onClick={handleDownload}
                            >
                                Download
                            </button>
                            <button
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full flex-1 hover:from-red-600 hover:to-red-700 transition-colors"
                                onClick={() => setShowCertificate(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}