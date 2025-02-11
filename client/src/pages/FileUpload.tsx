import React, { useState, useCallback } from 'react';
import { Upload, X, Download, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {ethers} from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import contractABI from '../contractABI.js';
const CONTRACT_ADDRESS = "0xA6002B2fd5A1052A3493fb4e839f7489Abf1bb57";

// interface FileWithPreview extends File {
//     preview?: string;
// }

// interface UploadedFile {
//     id: string;
//     name: string;
//     size: number;
//     uploadDate: Date;
//     url: string;
// }

// export function FileUpload() {
//     const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
//     const [isUploading, setIsUploading] = useState(false);
//     const [notification, setNotification] = useState<{
//         type: 'success' | 'error';
//         message: string;
//     } | null>(null);

//     // Sample uploaded files data
//     const [uploadedFiles] = useState<UploadedFile[]>([]);

//     const onDrop = useCallback((acceptedFiles: File[]) => {
//         setSelectedFiles(acceptedFiles.map(file =>
//             Object.assign(file, { preview: URL.createObjectURL(file) })
//         ));
//     }, []);

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         onDrop,
//         multiple: true,
//     });

//     const removeFile = (index: number) => {
//         setSelectedFiles(files => files.filter((_, i) => i !== index));
//     };

//     const handleUpload = async () => {
//         if (selectedFiles.length === 0) return;

//         setIsUploading(true);
//         try {
//             // Simulated upload delay
//             await new Promise(resolve => setTimeout(resolve, 2000));

//             setNotification({
//                 type: 'success',
//                 message: 'Files uploaded successfully!',
//             });
//             setSelectedFiles([]);
//         } catch (error) {
//             setNotification({
//                 type: 'error',
//                 message: 'Failed to upload files. Please try again.',
//             });
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const formatFileSize = (bytes: number) => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     const formatDate = (date: Date) => {
//         return new Intl.DateTimeFormat('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//         }).format(date);
//     };

//     return (
//         <div className="page-transition pt-16">
//             {/* Hero Section */}
//             <section className="py-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
//                         Secure File Upload
//                     </h1>
//                     <p className="text-center text-gray-600 dark:text-gray-300">
//                         Upload your files securely with blockchain-powered encryption
//                     </p>
//                 </div>
//             </section>

//             {/* Upload Section */}
//             <section className="py-12 bg-white dark:bg-gray-800">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     {/* Notification */}
//                     {notification && (
//                         <div className={`mb-6 p-4 rounded-lg flex items-center ${notification.type === 'success'
//                                 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
//                                 : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
//                             }`}>
//                             {notification.type === 'success' ? (
//                                 <CheckCircle className="w-5 h-5 mr-2" />
//                             ) : (
//                                 <AlertCircle className="w-5 h-5 mr-2" />
//                             )}
//                             {notification.message}
//                         </div>
//                     )}

//                     {/* Dropzone */}
//                     <div
//                         {...getRootProps()}
//                         className={`card border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer ${isDragActive ? 'border-indigo-500 dark:border-indigo-400' : ''
//                             }`}
//                     >
//                         <input {...getInputProps()} />
//                         <div className="text-center">
//                             <Upload className="w-12 h-12 mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
//                             <p className="text-lg font-medium mb-2">
//                                 {isDragActive
//                                     ? 'Drop the files here...'
//                                     : 'Drag & drop files here, or click to select files'}
//                             </p>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                 Supported file types: All formats
//                             </p>
//                         </div>
//                     </div>

//                     {/* Selected Files */}
//                     {selectedFiles.length > 0 && (
//                         <div className="mt-6 space-y-4">
//                             <h3 className="text-lg font-semibold">Selected Files</h3>
//                             <div className="space-y-2">
//                                 {selectedFiles.map((file, index) => (
//                                     <div
//                                         key={index}
//                                         className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
//                                     >
//                                         <div className="flex items-center">
//                                             <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
//                                             <span className="font-medium">{file.name}</span>
//                                             <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
//                                                 ({formatFileSize(file.size)})
//                                             </span>
//                                         </div>
//                                         <button
//                                             onClick={() => removeFile(index)}
//                                             className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
//                                         >
//                                             <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                             <button
//                                 onClick={handleUpload}
//                                 disabled={isUploading}
//                                 className="gradient-btn w-full flex items-center justify-center"
//                             >
//                                 {isUploading ? (
//                                     <>
//                                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         Uploading...
//                                     </>
//                                 ) : (
//                                     'Upload Files'
//                                 )}
//                             </button>
//                         </div>
//                     )}

//                     {/* Uploaded Files */}
//                     <div className="mt-12">
//                         <h3 className="text-xl font-bold mb-6">Recent Uploads</h3>
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="text-left border-b border-gray-200 dark:border-gray-700">
//                                         <th className="pb-3 font-semibold">File Name</th>
//                                         <th className="pb-3 font-semibold">Size</th>
//                                         <th className="pb-3 font-semibold">Upload Date</th>
//                                         <th className="pb-3 font-semibold">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                                     {uploadedFiles.map(file => (
//                                         <tr key={file.id} className="group">
//                                             <td className="py-4">
//                                                 <div className="flex items-center">
//                                                     <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
//                                                     {file.name}
//                                                 </div>
//                                             </td>
//                                             <td className="py-4 text-gray-500 dark:text-gray-400">
//                                                 {formatFileSize(file.size)}
//                                             </td>
//                                             <td className="py-4 text-gray-500 dark:text-gray-400">
//                                                 {formatDate(file.uploadDate)}
//                                             </td>
//                                             <td className="py-4">
//                                                 <div className="flex space-x-2">
//                                                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
//                                                         <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                                                     </button>
//                                                     <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors">
//                                                         <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </div>
//     );
// }


// import React, { useState } from 'react';
// import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';


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
            const ipfsResponse = await fetch("http://localhost:5000/upload-to-ipfs", {
                method: "POST",
                body: formData,
            });

            if (!ipfsResponse.ok) {
                throw new Error("Failed to upload file to IPFS.");
            }

            const ipfsData = await ipfsResponse.json();
            const { ipfsHash, url } = ipfsData;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS, 
                contractABI, 
                signer
            );
            
            const tx = await contract.uploadFile(ipfsHash);
            await tx.wait();

            // Step 2: Store File Hash on Blockchain
            // const blockchainResponse = await fetch("http://localhost:5000/upload", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({ fileHash: ipfsHash }),
            // });

            // if (!blockchainResponse.ok) {
            //     throw new Error("Failed to store file hash on blockchain.");
            // }

            // const blockchainData = await blockchainResponse.json();

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
