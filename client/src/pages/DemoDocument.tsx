import React, { useState } from 'react';
import { FileText, Grid, List, MoreVertical, Download, Trash2, Image, File, Music, Video, Folder } from 'lucide-react';

interface Document {
    id: string;
    name: string;
    type: 'image' | 'document' | 'music' | 'video' | 'folder';
    size: number;
    lastModified: Date;
    url: string;
}

export function MyDocuments() {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    // Sample documents data
    const [documents] = useState<Document[]>([
        {
            id: '1',
            name: 'Project Presentation.pdf',
            type: 'document',
            size: 2500000,
            lastModified: new Date('2024-03-15'),
            url: '#'
        },
        {
            id: '2',
            name: 'Team Photo.jpg',
            type: 'image',
            size: 1500000,
            lastModified: new Date('2024-03-14'),
            url: '#'
        },
        {
            id: '3',
            name: 'Meeting Recording.mp3',
            type: 'music',
            size: 5000000,
            lastModified: new Date('2024-03-13'),
            url: '#'
        },
        {
            id: '4',
            name: 'Product Demo.mp4',
            type: 'video',
            size: 15000000,
            lastModified: new Date('2024-03-12'),
            url: '#'
        },
        {
            id: '5',
            name: 'Project Assets',
            type: 'folder',
            size: 0,
            lastModified: new Date('2024-03-11'),
            url: '#'
        }
    ]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'image':
                return <Image className="w-6 h-6" />;
            case 'music':
                return <Music className="w-6 h-6" />;
            case 'video':
                return <Video className="w-6 h-6" />;
            case 'folder':
                return <Folder className="w-6 h-6" />;
            default:
                return <FileText className="w-6 h-6" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const handleDelete = (id: string) => {
        // Handle delete functionality
        console.log('Deleting file:', id);
    };

    const handleDownload = (url: string) => {
        // Handle download functionality
        console.log('Downloading file:', url);
    };

    return (
        <div className="page-transition pt-16">
            {/* Hero Section */}
            <section className="py-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                        My Documents
                    </h1>
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        Manage all your secure documents in one place
                    </p>
                </div>
            </section>

            {/* Documents Section */}
            <section className="py-12 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* View Toggle */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setViewType('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewType === 'grid'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewType('list')}
                                className={`p-2 rounded-lg transition-colors ${viewType === 'list'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Grid View */}
                    {viewType === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="card group hover:shadow-lg transition-shadow duration-200 relative"
                                    onMouseEnter={() => setSelectedFile(doc.id)}
                                    onMouseLeave={() => setSelectedFile(null)}
                                >
                                    <div className="flex items-center justify-center h-32 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-lg">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium truncate" title={doc.name}>
                                            {doc.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatFileSize(doc.size)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(doc.lastModified)}
                                        </p>
                                    </div>
                                    {selectedFile === doc.id && (
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <button
                                                onClick={() => handleDownload(doc.url)}
                                                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List View */}
                    {viewType === 'list' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                        <th className="pb-3 font-semibold">Name</th>
                                        <th className="pb-3 font-semibold">Size</th>
                                        <th className="pb-3 font-semibold">Modified</th>
                                        <th className="pb-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {documents.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="py-4">
                                                <div className="flex items-center">
                                                    {getFileIcon(doc.type)}
                                                    <span className="ml-2">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">
                                                {formatFileSize(doc.size)}
                                            </td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">
                                                {formatDate(doc.lastModified)}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDownload(doc.url)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                    >
                                                        <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}