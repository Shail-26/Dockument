import React, { useEffect, useState } from 'react';
import { Grid, List, Trash2, Image, FileText, Music, Video, Folder } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface Document {
    id: string;
    ipfsHash: string;
    type: 'image' | 'document' | 'music' | 'video' | 'folder';
    lastModified: string;
    url: string;
}

export function MyDocuments() {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const { walletAddress } = useWallet();

    useEffect(() => {
        if (walletAddress) {
            fetchUserFiles(walletAddress);
        }
    }, [walletAddress]);

    const fetchUserFiles = async (wallet: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-files/${wallet}`);
            if (!response.ok) throw new Error('Failed to fetch files');
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'API error');
            
            const docs = data.files.map((cid: string, index: number) => ({
                id: index.toString(),
                ipfsHash: cid,
                type: 'document',
                lastModified: '00',
                url: `https://gateway.pinata.cloud/ipfs/${cid}`
            }));
            
            setDocuments(docs);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!window.confirm(`Are you sure you want to delete this document?`)) return;
        const fileHash = await doc.ipfsHash;
        
        try {
            const response = await fetch('http://localhost:5000/api/delete-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileHash })
            });

            if (!response.ok) throw new Error('Failed to delete file');
            const result = await response.json();
            console.log('Deleted successfully:', result);
            // setDocuments(documents.filter(d => d.id !== doc.id));
            setDocuments((prevDocs) => prevDocs.filter(doc => doc.ipfsHash !== fileHash));
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    return (
        <div className="page-transition pt-16">
            <section className="py-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center">My Documents</h1>
                    <p className="text-center">Manage all your secure documents in one place</p>
                </div>
            </section>

            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setViewType('grid')} className="p-2 rounded-lg bg-gray-100">
                                <Grid className="w-5 h-5" />
                            </button>
                            <button onClick={() => setViewType('list')} className="p-2 rounded-lg bg-gray-100">
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {viewType === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {documents.map((doc) => (
                                <div key={doc.id} className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                                    onClick={() => setSelectedDoc(doc)}>
                                    <FileText className="w-6 h-6" />
                                    <p className="text-gray-500">Modified: {doc.lastModified}</p>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                                        className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {viewType === 'list' && (
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="pb-3">File</th>
                                    <th className="pb-3">Modified</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id} onClick={() => setSelectedDoc(doc)} className="hover:bg-gray-100">
                                        <td className="py-4">
                                            <FileText className="w-6 h-6" />
                                        </td>
                                        <td className="py-4">{doc.lastModified}</td>
                                        <td className="py-4">
                                            <button onClick={() => handleDelete(doc)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {selectedDoc && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Document Preview</h3>
                        <iframe src={selectedDoc.url} className="w-[500px] h-[400px]"></iframe>
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setSelectedDoc(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
