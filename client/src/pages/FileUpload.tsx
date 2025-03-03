import React, { useState, useCallback } from 'react';
import { Upload, X, Download, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {ethers} from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info.jsx';

export function FileUpload() {
    const { walletAddress } = useWallet(); 
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [response, setResponse] = useState<{
        success: boolean;
        ipfsHash: string;
        url: string;
        txHash?: string;
    } | null>(null);

    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedFile || !walletAddress) return;

        setIsUploading(true);
        setNotification(null);
        setResponse(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // Step 1: Upload to IPFS
            const ipfsResponse = await fetch("http://localhost:5000/api/upload-to-ipfs", {
                method: "POST",
                body: formData,
            });

            if (!ipfsResponse.ok) {
                throw new Error("Failed to upload file to IPFS.");
            }

            const ipfsData = await ipfsResponse.json();
            const { ipfsHash, url } = ipfsData;

            // Step 2: Send IPFS hash to backend for blockchain storage

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS, 
                ContractAbi, 
                signer
            );
            
            const tx = await contract.uploadFile(ipfsHash);
            await tx.wait();

            setResponse({
                success: true,
                ipfsHash,
                url,
                txHash: tx.hash,
            });
            setNotification({ type: "success", message: "File uploaded and stored on blockchain successfully!" });

        } catch (error) {
            setNotification({ type: "error", message: "Error uploading file. Please try again." });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="page-transition pt-16 ">
            <section className="py-12 bg-transparent ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        Upload File to IPFS & Blockchain
                    </h1>
                </div>
            </section>

            <section className="py-12 bg-transparent">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {notification && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${
                            notification.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {notification.type === "success" ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <AlertCircle className="w-5 h-5 mr-2" />
                            )}
                            {notification.message}
                        </div>
                    )}

                    <form id="uploadForm" onSubmit={handleFormSubmit} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="mb-4 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-6">
                            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-10 h-10 text-gray-500 mb-2" />
                                <span className="text-gray-600 dark:text-gray-300">Click to upload a file</span>
                                <input type="file" id="fileInput" name="file" required onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        {selectedFile && <div className="text-gray-700 dark:text-gray-300 text-center mb-4">Selected File: {selectedFile.name}</div>}

                        <button type="submit" disabled={isUploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                "Upload"
                            )}
                        </button>
                    </form>

                    {response && (
                        <div className="mt-12">
                            <h3 className="text-xl font-bold mb-6">Recent Uploads</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 font-semibold">File Status</th>
                                            <th className="pb-3 font-semibold">IPFS Hash</th>
                                            <th className="pb-3 font-semibold">URL</th>
                                            <th className="pb-3 font-semibold">Transaction Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        <tr key="1" className="group">
                                            <td className="py-4">{response.success ? "Uploaded Successfully" : "Failed to Upload"}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{response.ipfsHash}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">
                                                <a href={response.url} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400">View File</a>
                                            </td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">
                                                <a href={`https://sepolia.etherscan.io/tx/${response.txHash}`} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400">View Transaction</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
