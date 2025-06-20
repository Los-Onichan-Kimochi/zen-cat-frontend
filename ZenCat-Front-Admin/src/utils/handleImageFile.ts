export function handleImageFile(
  event: React.ChangeEvent<HTMLInputElement>,
  setImagePreview: (url: string) => void,
  setImageFile: (file: File) => void,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  setImageFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
}

/**
 * Converts a File to a byte array for S3 backend
 */
export function fileToByteArray(file: File): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const byteArray = Array.from(new Uint8Array(reader.result));
        resolve(byteArray);
      } else {
        reject(new Error('Failed to convert file to ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converts a Base64 string from backend to a blob URL for display
 */
export function base64ToImageUrl(base64String: string): string {
  try {
    // Convert base64 to binary string
    const binaryString = atob(base64String);
    
    // Convert binary string to Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // Try to detect image type from first few bytes
    let mimeType = 'image/jpeg'; // default
    if (uint8Array.length >= 4) {
      // Check for PNG signature
      if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
        mimeType = 'image/png';
      }
      // Check for JPEG signature
      else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
        mimeType = 'image/jpeg';
      }
      // Check for GIF signature
      else if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
        mimeType = 'image/gif';
      }
      // Check for WebP signature
      else if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46) {
        mimeType = 'image/webp';
      }
    }
    
    const blob = new Blob([uint8Array], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('Error al procesar Base64:', error);
    throw error;
  }
}

/**
 * Enhanced image file handler that also converts to byte array
 */
export function handleImageFileWithBytes(
  event: React.ChangeEvent<HTMLInputElement>,
  setImagePreview: (url: string) => void,
  setImageFile: (file: File) => void,
  setImageBytes?: (bytes: number[]) => void,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  setImageFile(file);

  // Create preview URL
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);

  // Convert to byte array if callback provided
  if (setImageBytes) {
    fileToByteArray(file)
      .then(setImageBytes)
      .catch(console.error);
  }
}
