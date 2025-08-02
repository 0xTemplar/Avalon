import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface PinataFileResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
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

    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      keepExtensions: true,
    });

    const [, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create FormData for Pinata
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'file',
      contentType: file.mimetype || 'application/octet-stream',
    });

    // Add Pinata metadata
    const pinataMetadata = JSON.stringify({
      name: file.originalFilename || 'uploaded-file',
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        originalName: file.originalFilename || 'file',
        size: file.size.toString(),
      },
    });
    formData.append('pinataMetadata', pinataMetadata);

    // Add Pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata file upload error:', response.status, errorText);

      if (response.status === 401) {
        return res.status(500).json({ error: 'IPFS authentication failed' });
      }

      return res.status(500).json({
        error: 'Failed to upload file to IPFS',
        details: errorText,
      });
    }

    const data = (await response.json()) as PinataFileResponse;

    // Return both the IPFS hash and the full gateway URL
    const result = {
      IpfsHash: data.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      pinSize: data.PinSize,
      timestamp: data.Timestamp,
      filename: file.originalFilename,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
