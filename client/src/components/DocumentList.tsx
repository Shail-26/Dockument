import { FileText, Trash2 } from 'lucide-react';

interface Document {
    fileHash: string;
    filename: string;
    timestamp: number;
    status: string;
}

interface DocumentListProps {
    documents: Document[];
    title: string;
    viewType: 'grid' | 'list';
    onSelect: (doc: Document) => void;
    onDelete: (doc: Document) => void;
}

export function DocumentList({ documents, title, viewType, onSelect, onDelete }: DocumentListProps) {
    if (documents.length === 0) {
        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-500">No {title.toLowerCase()} found</p>  
            </div>
        )
    }

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div
                            key={doc.fileHash}
                            className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                            onClick={() => onSelect(doc)}
                        >
                            <FileText className="w-6 h-6" />
                            <p className="font-medium truncate">{doc.filename}</p>
                            <p className="text-gray-500">Modified: {new Date(doc.timestamp).toLocaleString()}</p>
                            <p className={`text-sm ${doc.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                {doc.status}
                            </p>
                            {doc.status !== 'Shared' && (
                                        <button
                                            title="Delete Document"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(doc);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={doc.status !== 'Active'}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                            
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
                            <tr key={doc.fileHash} onClick={() => onSelect(doc)} className="hover:bg-gray-100">
                                <td className="py-4">{doc.filename}</td>
                                <td className="py-4">{new Date(doc.timestamp).toLocaleString()}</td>
                                <td className="py-4 text-sm font-medium">{doc.status}</td>
                                <td className="py-4">
                                    {doc.status !== 'Shared' && (
                                        <button
                                            title="Delete Document"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(doc);
                                            }}
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
}