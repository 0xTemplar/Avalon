import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface QuestMetadata {
  title: string;
  description: string;
  requirements: {
    skillsRequired: string[];
    minReputation: number;
    kycRequired: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
  };
  tags: string[];
  questType: string;
  createdAt: string;
  creator: string;
  additionalInfo?: Record<string, any>;
}

export interface IPFSUploadResult {
  hash: string;
  url: string;
  filename: string;
}

export const usePinata = () => {
  const [uploading, setUploading] = useState(false);

  const uploadToIPFS = useCallback(
    async (data: QuestMetadata): Promise<string> => {
      try {
        setUploading(true);

        toast.info('Uploading metadata to IPFS...', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ccff',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        const response = await fetch('/api/pinata/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload to IPFS');
        }

        const result = await response.json();

        toast.success('Metadata uploaded to IPFS!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ff88',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        return result.ipfsUrl;
      } catch (error) {
        console.error('Error uploading to IPFS:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload to IPFS';

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #ff0088',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        throw error;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const uploadFileToIPFS = useCallback(
    async (file: File): Promise<IPFSUploadResult> => {
      try {
        setUploading(true);

        toast.info('Uploading file to IPFS...', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ccff',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/pinata/upload-file', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload file to IPFS');
        }

        const result = await response.json();

        toast.success(`${file.name} uploaded to IPFS!`, {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ff88',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        // Return both hash and URL for smart contract compatibility
        return {
          hash: result.IpfsHash, // For smart contract
          url: result.ipfsUrl, // For preview
          filename: result.filename,
        };
      } catch (error) {
        console.error('Error uploading file to IPFS:', error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to upload file to IPFS';

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #ff0088',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        throw error;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return {
    uploading,
    uploadToIPFS,
    uploadFileToIPFS,
  };
};
