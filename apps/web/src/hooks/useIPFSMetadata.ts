import { useState, useEffect } from 'react';
import { fetchIPFSData } from '@/utils/fetchIpfs';

export interface IPFSMetadata {
    description?: string;
    image?: string;
    recipt?: string;
    serial_number?: string;
    spec?: string;
    external_link?: string;
    properties?: {
        category?: string;
    };
}

export const useIPFSMetadata = (ipfsHash: string) => {
    const [metadata, setMetadata] = useState<IPFSMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ipfsHash || !ipfsHash.startsWith('ipfs://')) {
            console.log('No valid IPFS hash provided:', ipfsHash);
            setMetadata(null);
            return;
        }

        const fetchMetadata = async () => {
            console.log('Fetching IPFS metadata for:', ipfsHash);
            setIsLoading(true);
            setError(null);

            try {
                const data = await fetchIPFSData(ipfsHash);
                console.log('IPFS metadata fetched:', data);
                setMetadata(data);
            } catch (err) {
                console.error('Error fetching IPFS metadata:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
                setMetadata(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [ipfsHash]);

    return { metadata, isLoading, error };
};
