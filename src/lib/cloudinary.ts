// Folder structure in Cloudinary
export const CLOUDINARY_FOLDERS = {
  GALLERY: 'gallery',
  GUESTS: 'guests',
  HOSTS: 'hosts',
  LOCAL_GUIDE: 'local-guide',
  LOGO: 'logo',
} as const;

export type CloudinaryFolder = typeof CLOUDINARY_FOLDERS[keyof typeof CLOUDINARY_FOLDERS];

/**
 * Build a Cloudinary URL with transformations
 * @param publicId - The public ID of the image (without folder)
 * @param folder - The folder where the image is stored
 * @param options - Transformation options
 */
export function getCloudinaryUrl(
  publicId: string,
  folder?: CloudinaryFolder,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  }
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured');
    return publicId; // Return as-is if not configured
  }

  // If it's already a full URL or a local path, return as-is
  if (publicId.startsWith('http') || publicId.startsWith('/')) {
    return publicId;
  }

  const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

  // Build transformation string
  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.gravity) transformations.push(`g_${options.gravity}`);

  const transformString = transformations.length > 0
    ? `/${transformations.join(',')}`
    : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload${transformString}/${fullPublicId}`;
}

/**
 * Get optimized image URL for Next.js Image component
 * This returns a base URL that Next.js can further optimize
 */
export function getOptimizedImageUrl(
  publicId: string,
  folder?: CloudinaryFolder
): string {
  return getCloudinaryUrl(publicId, folder, {
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get thumbnail URL for gallery/carousel
 */
export function getThumbnailUrl(
  publicId: string,
  folder?: CloudinaryFolder,
  size: number = 400
): string {
  return getCloudinaryUrl(publicId, folder, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto',
  });
}

/**
 * Get optimized URL for lightbox display (max 1200x800)
 */
export function getLightboxUrl(
  url: string,
  maxWidth: number = 1200,
  maxHeight: number = 800
): string {
  // Se não é URL do Cloudinary, retornar como está
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return url;

  // Extrair public_id da URL
  const publicId = extractPublicId(url);
  if (!publicId) return url;

  // Construir URL otimizada para lightbox
  const transformations = [
    `w_${maxWidth}`,
    `h_${maxHeight}`,
    'c_limit', // Mantém aspect ratio, limitando às dimensões máximas
    'q_auto:good',
    'f_auto',
  ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Get YouTube video ID from URL
 */
export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^([^"&?\/\s]{11})$/, // Caso seja só o ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get YouTube thumbnail URL
 * @param url - YouTube video URL or embed URL
 * @param quality - Thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
 */
export function getYouTubeThumbnail(
  url: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'
): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;

  // Match pattern: /upload/[optional transformations]/[public_id]
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

/**
 * Upload options for Cloudinary
 */
export interface UploadOptions {
  folder: CloudinaryFolder;
  publicId?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
  };
}
