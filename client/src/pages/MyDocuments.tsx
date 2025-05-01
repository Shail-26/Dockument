import { useState, useEffect } from 'react';
import { Grid, List } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext.js';
import { NotificationBanner } from '../components/issuer/NotificationBanner';
import { DocumentList } from '../components/DocumentList';
import { SharedDocumentsList } from '../components/SharedDocumentsList';
import { SharedByOwnerList } from '../components/SharedByOwnerList';
import { DocumentModal } from '../components/DocumentModal';
import { useUserFiles } from '../hooks/useUserFiles';
import { useSharedDocuments } from '../hooks/useSharedDocuments.js';
import { useSharedByOwner } from '../hooks/useSharedByOwner';
import { Contract } from 'ethers';
import { ContractAbi, CONTRACT_ADDRESS } from '../contract_info.js';
import { Document } from '../types.js';

export function MyDocuments() {
  const [viewType, setViewType] = useState('grid');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [notification, setNotification] = useState(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [shareRecipient, setShareRecipient] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [shareDuration, setShareDuration] = useState(0);

  const { walletAddress, provider, refreshFiles } = useWallet();
  if (!walletAddress) return;

  const { uploadedDocuments, issuedDocuments, isLoading } = useUserFiles(walletAddress, provider);
  const { sharedDocuments } = useSharedDocuments(walletAddress, provider);
  const { sharedByOwner } = useSharedByOwner(walletAddress, provider);

  useEffect(() => {
    const fetchAvailableFields = async () => {
      if (!selectedDoc || !provider || selectedDoc.filename !== 'ISSUED CREDENTIAL') {
        setAvailableFields([]);
        setSelectedFields([]);
        return;
      }

      try {
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
        const metadataUrl = `https://ipfs.io/ipfs/${selectedDoc.fileHash}`;
        const response = await fetch(metadataUrl);

        if (response.ok) {
          const metadata = await response.json();
          const fields = Object.keys(metadata).filter(
            (key) => key !== 'fileHash' && key !== 'fileName' && key !== 'timestamp'
          );
          setAvailableFields(fields);
        } else {
          const mandatoryFields = await contract.getMandatoryFields(selectedDoc.fileHash);
          const parsedFields = JSON.parse(mandatoryFields).fields || ['name', 'type', 'course'];
          setAvailableFields(parsedFields);
        }
      } catch (error) {
        console.error('Error fetching available fields:', error);
        setAvailableFields(['name', 'type', 'course']);
      }
      setSelectedFields([]);
    };

    fetchAvailableFields();
  }, [selectedDoc, provider]);

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete this document (${doc.fileHash})?`)) return;

    try {
      if (!provider) throw new Error('Provider not available');
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ContractAbi, signer);
      const tx = await contract.deleteFile(doc.metadataCID);
      console.log('Transaction submitted:', tx.hash);
      await tx.wait();
      setUploadedDocuments((prevDocs) => prevDocs.filter((d) => d.fileHash !== doc.fileHash));
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
        (doc: Document) =>
          doc.fileHash === selectedDoc.fileHash &&
          doc.recipient === shareRecipient &&
          doc.expiration > Date.now()
      );

      if (existingShare) {
        const existingFields = existingShare.allowedFields || [];
        const fieldsAreIdentical =
          selectedFields.length === existingFields.length &&
          selectedFields.every((field) => existingFields.includes(field)) &&
          existingFields.every((field) => selectedFields.includes(field));

        if (fieldsAreIdentical) {
          setNotification({
            type: 'error',
            message: 'This credential is already shared with this recipient with the same fields.',
          });
          return;
        } else {
          const updatedFields = [...new Set([...existingFields, ...selectedFields])];
          const tx = await contract.shareCredential(
            selectedDoc.fileHash,
            shareRecipient,
            updatedFields,
            shareDuration
          );
          console.log('Modify share transaction submitted:', tx.hash);
          setNotification({
            type: 'success',
            message: 'Sharing modified with new fields! Waiting for confirmation...',
            txHash: tx.hash,
          });
          await tx.wait();
          setNotification({
            type: 'success',
            message: 'Sharing modified successfully!',
            txHash: tx.hash,
          });
        }
      } else {
        const tx = await contract.shareCredential(
          selectedDoc.fileHash,
          shareRecipient,
          selectedFields,
          shareDuration
        );
        console.log('Share transaction submitted:', tx.hash);
        setNotification({
          type: 'success',
          message: 'Credential shared successfully! Waiting for confirmation...',
          txHash: tx.hash,
        });
        await tx.wait();
        setNotification({
          type: 'success',
          message: 'Credential shared successfully!',
          txHash: tx.hash,
        });
      }
      // fetchSharedByOwner();
      setShareRecipient('');
      setSelectedFields([]);
      setShareDuration(0);
    } catch (error) {
      console.error('Error sharing credential:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to share credential',
      });
    } finally {
      setTimeout(() => setNotification(null), 5000);
      setSelectedDoc(null);
    }
  };

  return (
    <div className="page-transition pt-16">
      <section className="py-12 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">My Documents</h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Manage all your secure documents in one place
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between mb-8">
            <button
              title="Grid View"
              onClick={() => setViewType('grid')}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Grid className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
            <button
              title="List View"
              onClick={() => setViewType('list')}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <List className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
          </div>

          <NotificationBanner notification={notification} />

          {isLoading ? (
            <div className="flex justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : (
            <>
              <DocumentList
                documents={uploadedDocuments}
                title="Uploaded Files"
                viewType={viewType}
                onSelect={setSelectedDoc}
                onDelete={handleDelete}
              />
              <DocumentList
                documents={issuedDocuments}
                title="Issued Credentials"
                viewType={viewType}
                onSelect={setSelectedDoc}
                onDelete={handleDelete}
              />
              <SharedDocumentsList documents={sharedDocuments} viewType={viewType} onSelect={setSelectedDoc} />
              <SharedByOwnerList documents={sharedByOwner} viewType={viewType} onSelect={setSelectedDoc} />
            </>
          )}
        </div>
      </section>

      {selectedDoc && (
        <DocumentModal
          selectedDoc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          shareRecipient={shareRecipient}
          setShareRecipient={setShareRecipient}
          selectedFields={selectedFields}
          setSelectedFields={setSelectedFields}
          shareDuration={shareDuration}
          setShareDuration={setShareDuration}
          availableFields={availableFields}
          handleShareCredential={handleShareCredential}
          provider={provider}
          walletAddress={walletAddress}
          notification={notification}
          setNotification={setNotification}
        />
      )}
    </div>
  );
}