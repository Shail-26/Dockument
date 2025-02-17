import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Upload, X, Download, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useWallet } from '../contexts/WalletContext';
import contractABI from '../contractABI.js';
const CONTRACT_ADDRESS = "0xA6002B2fd5A1052A3493fb4e839f7489Abf1bb57";

export function DocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [response, setResponse] = useState<{
    success: boolean;
    ipfsHash: string;
    url: string;
    txHash?: string;
} | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
      const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log("Connected Wallet:", address);
      // setWalletAddress(address);
      // fetchUserFiles(address);
    } else {
      alert("Please install MetaMask.");
    }
  };

  // const fetchUserFiles = async (wallet) => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
  //     const cids = await contract.getUserFiles(wallet);
  //     console.log("Fetched CIDs:", cids);
      
  //     const docs = cids.map(cid => ({
  //       name: `Document - ${cid}`,
  //       url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  //       ipfsHash: cid
  //     }));

  //     setDocuments(docs);
  //     setResponse({ success: true, ipfsHash: cids[0], url: docs[0]?.url, txHash: "0xSampleTxHash" });
  //   } catch (error) {
  //     console.error("Error fetching documents:", error);
  //   }
  // };

  const { walletAddress } = useWallet(); 
      
      
  
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
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Your Documents</h2>
      {walletAddress ? (
        <p>Connected Wallet: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {documents.length > 0 ? (
          documents.map((doc, index) => (
            <div key={index} className="p-4 border rounded cursor-pointer hover:bg-gray-100" onClick={() => setSelectedDoc(doc)}>
              {doc.name}
            </div>
          ))
        ) : (
          <p>No documents found.</p>
        )}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-bold mb-4">{selectedDoc.name}</h3>
            <iframe src={selectedDoc.url} className="w-[500px] h-[400px]"></iframe>
            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setSelectedDoc(null)}>
              Close
            </button>
          </div>
        </div>
      )}

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
  );
}
