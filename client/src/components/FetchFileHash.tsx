import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

const FetchFileHash = ({ metadataCID }: { metadataCID: string }) => {
    const [fileHash, setFileHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch(`https://ipfs.io/ipfs/${metadataCID}`);
                const metadata = await response.json();
                if (metadata.fileHash) {
                    setFileHash(metadata.fileHash);
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [metadataCID]);

    if (loading) {
        return <span className="text-gray-500 dark:text-gray-400">Loading...</span>;
    }

    return fileHash ? (
        <a
            href={`https://ipfs.io/ipfs/${fileHash}`} // Link to actual file
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
            <span className="truncate max-w-[150px]">{fileHash}</span>
            <ExternalLink className="w-3 h-3 ml-1" />
        </a>
    ) : (
        <span className="text-gray-500 dark:text-gray-400">No file found</span>
    );
};

export default FetchFileHash;
