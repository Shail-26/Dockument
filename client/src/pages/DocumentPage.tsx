import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";

const CONTRACT_ADDRESS = "0xA9491CFd73f24A4De63Bae64706555CD04edE3e0";

export function DocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { walletAddress } = useWallet();

  useEffect(() => {
    if (walletAddress) {
      fetchUserFiles(walletAddress);
    }
  }, [walletAddress]);

  const fetchUserFiles = async (wallet) => {
    try {
      const apiResponse = await fetch(`http://localhost:5000/api/user-files/${wallet}`);
      if (!apiResponse.ok) {
        throw new Error("Failed to fetch user files from API.");
      }

      const data = await apiResponse.json();
      console.log("API Response:", data);

      if (!data.success) {
        throw new Error(data.error || "API returned unsuccessful response.");
      }

      const docs = data.files.map((cid, index) => ({
        name: `Document - ${index + 1}`,
        url: `https://gateway.pinata.cloud/ipfs/${cid}`,
        ipfsHash: cid,
      }));

      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Your Documents</h2>
      {walletAddress ? <p>Connected Wallet: {walletAddress}</p> : <p>Please connect your wallet.</p>}
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {documents.length > 0 ? (
          documents.map((doc, index) => (
            <div
              key={index}
              className="p-4 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedDoc(doc)}
            >
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
