# Pinata IPFS Setup Guide

## Overview

The quest creation system now uses real Pinata IPFS integration for storing quest metadata and files. This ensures decentralized storage and permanent accessibility of quest data.

## Setup Instructions

### 1. Get Your Pinata JWT Token

1. Go to [Pinata Cloud](https://app.pinata.cloud)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **New Key**
5. Give it a name like "Aryza Quest Platform"
6. Select appropriate permissions:
   - ✅ **pinFileToIPFS**
   - ✅ **pinJSONToIPFS**
   - ✅ **unpin**
7. Copy the generated JWT token

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/aryza` directory with:

```env
# Privy configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Pinata IPFS configuration
PINATA_JWT_TOKEN=your_pinata_jwt_token_here
```

**Important Notes:**

- The `PINATA_JWT_TOKEN` should **NOT** have the `NEXT_PUBLIC_` prefix
- This keeps the token secure on the server-side only
- Never commit your `.env.local` file to version control

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the quest creation form
3. Fill out a quest and submit
4. Check your Pinata dashboard to see the uploaded metadata

## API Endpoints

The integration uses two custom API routes:

### `/api/pinata/upload`

- **Purpose**: Upload quest metadata (JSON) to IPFS
- **Method**: POST
- **Body**: Quest metadata object
- **Returns**: IPFS hash and gateway URL

### `/api/pinata/upload-file`

- **Purpose**: Upload files (images, documents) to IPFS
- **Method**: POST
- **Body**: FormData with file
- **Returns**: IPFS hash and gateway URL

## Features

### Quest Metadata Structure

```json
{
  "title": "Quest Title",
  "description": "Quest Description",
  "requirements": {
    "skillsRequired": ["Frontend Development", "UI/UX Design"],
    "minReputation": 0,
    "kycRequired": false,
    "allowedFileTypes": ["pdf", "doc", "jpg", "png"],
    "maxFileSize": 10485760
  },
  "tags": ["Development", "Design"],
  "questType": "Individual",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "creator": "0x1234...5678",
  "additionalInfo": {
    "submissionDeadline": 1704153600,
    "reviewDeadline": 1704326400,
    "maxParticipants": 5,
    "maxCollaborators": 2
  }
}
```

### Error Handling

- **Authentication errors**: Invalid JWT token
- **Upload failures**: Network or service issues
- **File size limits**: Maximum 100MB per file
- **Validation errors**: Missing required fields

### User Feedback

- **Loading states**: Visual indicators during uploads
- **Success notifications**: Confirmation of successful uploads
- **Error messages**: Clear error descriptions with suggested fixes

## Troubleshooting

### Common Issues

**1. "IPFS service not configured" error**

- Ensure `PINATA_JWT_TOKEN` is set in `.env.local`
- Restart your development server after adding environment variables

**2. "IPFS authentication failed" error**

- Check if your JWT token is valid
- Verify the token has correct permissions in Pinata dashboard

**3. "Failed to upload to IPFS" error**

- Check your internet connection
- Verify Pinata service status
- Ensure file size is under 100MB limit

**4. Quest creation succeeds but no files in Pinata**

- Check the Pinata dashboard Files section
- Look for files with metadata names like `quest-title-timestamp.json`

### Development Tips

1. **Testing**: Use small files during development to save bandwidth
2. **Monitoring**: Check Pinata dashboard for usage statistics
3. **Backups**: Consider pinning important quests to multiple IPFS providers
4. **Performance**: Large files may take time to upload, inform users accordingly

## Security Considerations

- JWT tokens are server-side only and never exposed to clients
- IPFS hashes are publicly accessible once uploaded
- Consider content moderation for publicly uploaded files
- Implement rate limiting for production use

## Cost Management

- Pinata has usage-based pricing
- Monitor your monthly usage in the dashboard
- Consider implementing file size limits for cost control
- Archive old or completed quests if needed

## Future Enhancements

- [ ] File type validation on upload
- [ ] Image compression and optimization
- [ ] Batch file uploads for quest assets
- [ ] IPFS cluster pinning for redundancy
- [ ] Content addressing for duplicate detection
