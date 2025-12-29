import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload options for Cloudinary
 */
export interface UploadOptions {
  folder: string;
  publicId?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
  };
}

/**
 * Get upload signature for client-side uploads
 */
export async function getUploadSignature(options: UploadOptions) {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    timestamp,
    folder: options.folder,
    ...(options.publicId && { public_id: options.publicId }),
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: options.folder,
  };
}
