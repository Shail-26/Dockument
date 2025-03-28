import { FileText } from 'lucide-react';

interface Document {
    fileHash: string;
    filename: string;
    expiration?: number;
    filteredMetadata?: Record<string, string>;
}

interface SharedDocumentsListProps {
    documents: Document[];
    viewType: 'grid' | 'list';
    onSelect: (doc: Document) => void;
}

export function SharedDocumentsList({ documents, viewType, onSelect }: SharedDocumentsListProps) {
    const validDocs = documents.filter((doc) => doc.expiration && doc.expiration > Date.now());

    if (validDocs.length === 0) {
        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Shared With Me</h2>
                <p className="text-gray-500">No shared credentials found</p>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Shared With Me</h2>
            {viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {validDocs.map((doc) => (
                        <div
                            key={doc.fileHash}
                            className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                            onClick={() => onSelect(doc)}
                        >
                            <FileText className="w-6 h-6" />
                            <p className="font-medium truncate">{doc.filename}</p>
                            <p className="text-gray-500">
                                Expires: {doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-sm text-blue-600">Shared Access</p>
                            {doc.filteredMetadata && (
                                <div className="mt-2 text-sm bg-gray-50 p-2 rounded border">
                                    {Object.entries(doc.filteredMetadata).map(([key, value]) => (
                                        <p key={key}>
                                            <strong className="capitalize">{key}:</strong> {value}
                                        </p>
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
                            <tr key={doc.fileHash} onClick={() => onSelect(doc)} className="hover:bg-gray-100">
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
}