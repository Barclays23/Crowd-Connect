// backend/src/utils/file.utils.ts

/**
 * Converts a base64 string or Data URI to a Node.js Buffer.
 * 
 * @param base64String - The base64 string or Data URI (e.g., "data:image/png;base64,...")
 * @returns Buffer containing the binary image data
 * @throws Error if the input is empty or invalid
 */
export const convertBase64ToBuffer = (base64String: string): Buffer => {
    if (!base64String) {
        throw new Error('Invalid image payload: base64 string is missing or empty.');
    }

    // Safely strip the Data URI prefix if it exists, leaving only the raw base64 data
    const rawBase64Data = base64String.replace(/^data:(.*,)?/, '');
    
    return Buffer.from(rawBase64Data, 'base64');
};