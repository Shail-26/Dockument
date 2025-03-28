import { FileText } from 'lucide-react';

interface Document {
    fileHash: string;
    recipient: string;
    filename: string;
    expiration?: number;
}

interface SharedByOwnerListProps {
    documents: Document[];
    viewType: 'grid' | 'table';
    onSelect: (doc: Document) => void;
}

export function SharedByOwnerList({ documents, viewType, onSelect }: SharedByOwnerListProps) {
    const activeDocs = documents.filter((doc) => doc.expiration && doc.expiration > Date.now());
    const expiredDocs = documents.filter((doc) => doc.expiration && doc.expiration <= Date.now());

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Shared By Me</h2>
            <h3 className="text-xl font-semibold mb-2">Active</h3>
            {activeDocs.length === 0 ? (
                <p className="text-gray-500 mb-6">No active credentials shared by you</p>
            ) : viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {activeDocs.map((doc) => (
                        <div
                            key={doc.fileHash + doc.recipient}
                            className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                            onClick={() => onSelect(doc)}
                        >
                            <FileText className="w-6 h-6" />
                            <p className="font-medium truncate">{doc.filename}</p>
                            <p className="text-gray-500 break-all">
                                Shared with: <span className="break-all">{doc.recipient}</span>
                            </p>
                            <p className="text-gray-500">
                                Expires: {doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-sm text-green-600">Active</p>
                        </div>
                    ))}
                </div>
            ) : (
                <table className="w-full mb-8">
                    <thead>
                        <tr>
                            <th className="pb-3 text-left">File</th>
                            <th className="pb-3 text-left">Shared With</th>
                            <th className="pb-3 text-left">Expires</th>
                            <th className="pb-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDocs.map((doc) => (
                            <tr
                                key={doc.fileHash + doc.recipient}
                                onClick={() => onSelect(doc)}
                                className="hover:bg-gray-100"
                            >
                                <td className="py-4">{doc.filename}</td>
                                <td className="py-4">{doc.recipient}</td>
                                <td className="py-4">{doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</td>
                                <td className="py-4 text-sm font-medium text-green-600">Active</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h3 className="text-xl font-semibold mb-2">Expired</h3>
            {expiredDocs.length === 0 ? (
                <p className="text-gray-500">No expired credentials shared by you</p>
            ) : viewType === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {expiredDocs.map((doc) => (
                        <div
                            key={doc.fileHash + doc.recipient}
                            className="card p-4 border rounded cursor-pointer hover:shadow-lg"
                            onClick={() => onSelect(doc)}
                        >
                            <FileText className="w-6 h-6" />
                            <p className="font-medium truncate">{doc.filename}</p>
                            <p className="text-gray-500 break-all">
                                Shared with: {doc.recipient}
                            </p>
                            <p className="text-gray-500">
                                Expired: {doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-sm text-red-600">Expired</p>
                        </div>
                    ))}
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="pb-3 text-left">File</th>
                            <th className="pb-3 text-left">Shared With</th>
                            <th className="pb-3 text-left">Expired</th>
                            <th className="pb-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expiredDocs.map((doc) => (
                            <tr
                                key={doc.fileHash + doc.recipient}
                                onClick={() => onSelect(doc)}
                                className="hover:bg-gray-100"
                            >
                                <td className="py-4">{doc.filename}</td>
                                <td className="py-4">{doc.recipient}</td>
                                <td className="py-4">{doc.expiration ? new Date(doc.expiration).toLocaleString() : 'N/A'}</td>
                                <td className="py-4 text-sm font-medium text-red-600">Expired</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}