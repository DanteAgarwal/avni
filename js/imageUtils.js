// Image compression utilities
// Add this as /js/imageUtils.js

/**
 * Compress an image to reduce file size
 * @param {string} base64 - Base64 encoded image
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Compressed base64 image
 */
export async function compressImage(base64, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      
      // Optional: Add white background for transparent images
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Draw compressed image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with quality setting
      const compressed = canvas.toDataURL('image/jpeg', quality);
      
      // Log compression ratio
      const originalSize = base64.length;
      const compressedSize = compressed.length;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      console.log(`Image compressed: ${ratio}% smaller (${Math.round(originalSize/1024)}KB → ${Math.round(compressedSize/1024)}KB)`);
      
      resolve(compressed);
    };
    
    img.onerror = (error) => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = base64;
  });
}

/**
 * Validate image before upload
 * @param {string} base64 - Base64 encoded image
 * @returns {Object} - Validation result
 */
export function validateImage(base64) {
  // Check if it's a valid base64 image
  if (!base64.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image format' };
  }
  
  // Check file size (base64 length ≈ file size * 1.37)
  const sizeInBytes = base64.length * 0.75;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  if (sizeInMB > 5) {
    return { valid: false, error: 'Image too large (max 5MB)' };
  }
  
  return { valid: true, size: sizeInMB };
}

/**
 * Create thumbnail for preview
 * @param {string} base64 - Base64 encoded image
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<string>} - Thumbnail base64
 */
export async function createThumbnail(base64, size = 150) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      
      // Calculate crop dimensions for center square
      const sourceSize = Math.min(img.width, img.height);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      
      // Draw cropped and scaled image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, size, size
      );
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.onerror = () => reject(new Error('Failed to create thumbnail'));
    img.src = base64;
  });
}