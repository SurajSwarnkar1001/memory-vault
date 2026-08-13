import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.R2_BUCKET_NAME;

// Initialize the S3 client configured for Cloudflare R2 using the S3 API Endpoint
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock',
  },
});

/**
 * Generate a presigned PUT URL for uploading a file directly to Cloudflare R2
 * @param {string} fileKey - Unique path in the bucket
 * @param {string} mimeType - File mimetype
 * @returns {Promise<string>} Presigned upload URL
 */
export const getUploadPresignedUrl = async (fileKey, mimeType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: mimeType,
    });
    
    // URL expires in 15 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  } catch (error) {
    console.error('Error generating upload presigned URL:', error);
    throw error;
  }
};

/**
 * Generate a presigned GET URL for securely viewing/downloading private files
 * @param {string} fileKey - Unique path in the bucket
 * @returns {Promise<string>} Presigned download URL
 */
export const getDownloadPresignedUrl = async (fileKey) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    
    // URL expires in 1 hour (3600 seconds)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating download presigned URL:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} fileKey - Unique path in the bucket
 * @returns {Promise<boolean>} Success indicator
 */
export const deleteFileFromR2 = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting object from R2:', error);
    throw error;
  }
};
