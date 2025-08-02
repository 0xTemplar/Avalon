import { NextApiRequest, NextApiResponse } from 'next';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pinataJWT = process.env.PINATA_JWT_TOKEN;

    if (!pinataJWT) {
      console.error('PINATA_JWT_TOKEN is not configured');
      return res.status(500).json({ error: 'IPFS service not configured' });
    }

    const questMetadata: QuestMetadata = req.body;

    // Validate required fields
    if (!questMetadata.title || !questMetadata.description) {
      return res
        .status(400)
        .json({ error: 'Title and description are required' });
    }

    const pinataPayload = {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `quest-${questMetadata.title
          .replace(/[^a-zA-Z0-9]/g, '-')
          .toLowerCase()}-${Date.now()}.json`,
        keyvalues: {
          questType: questMetadata.questType,
          creator: questMetadata.creator,
          tags: questMetadata.tags.join(','),
        },
      },
      pinataContent: questMetadata,
    };

    const response = await fetch(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pinataPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API error:', response.status, errorText);

      if (response.status === 401) {
        return res.status(500).json({ error: 'IPFS authentication failed' });
      }

      return res.status(500).json({
        error: 'Failed to upload to IPFS',
        details: errorText,
      });
    }

    const data: PinataResponse = await response.json();

    // Return both the IPFS hash and the full gateway URL
    const result = {
      IpfsHash: data.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      pinSize: data.PinSize,
      timestamp: data.Timestamp,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
