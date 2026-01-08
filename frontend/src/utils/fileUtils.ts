// frontend/src/utils/fileUtils.ts




// Check if a file/URL is PDF
export const isPDF = (fileOrUrl: File | string | null | undefined): boolean => {
   if (fileOrUrl instanceof File) return fileOrUrl.type === "application/pdf";

   if (typeof fileOrUrl === "string") {
      const url = fileOrUrl.toLowerCase();
      return url.endsWith(".pdf") || 
            url.includes("/pdf") || 
            url.includes("application/pdf") ||
            // Common cloud storage patterns
            url.includes("pdf%") ||
            url.includes("pdf?") ||
            // Check filename extension
            /\.pdf(\?|$)/i.test(url);
   }

   return false;
};



// Check if a file/URL is an image
export const isImage = (fileOrUrl: File | string | null | undefined): boolean => {
   if (fileOrUrl instanceof File) {
      return fileOrUrl.type.startsWith("image/");
   }

   if (typeof fileOrUrl === "string") {
      const url = fileOrUrl.toLowerCase();
      // Common image extensions
      return /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i.test(url) ||
            url.includes("image/") ||
            // Check for common image MIME types in URLs
            url.includes("image%") ||
            url.includes("image?");
   }

   return false;
};




// Extract filename from File or URL with smart fallback
export function getFileNameFromFileOrUrl(
fileOrUrl: File | string | null | undefined,
fallbackName: string = "document"
): string {

   if (!fileOrUrl) return `${fallbackName}`;

   // Handle File object
   if (fileOrUrl instanceof File) {
      return fileOrUrl.name;
   }

   // Handle string URL
   if (typeof fileOrUrl !== "string") return `${fallbackName}`;

   try {
      const url = new URL(fileOrUrl);
      let filename = url.pathname.split("/").pop() || "";

      // Remove query string and hash
      filename = filename.split("?")[0].split("#")[0];

      // Common cloud storage patterns (Cloudinary, AWS S3, etc.)
      // Remove version prefixes like v1698765432_
      if (/^v\d+_/.test(filename)) {
         filename = filename.replace(/^v\d+_/, "");
      }
      
      // Remove timestamp prefixes
      filename = filename.replace(/^\d+_/, "");

      // If still empty or just numbers/special chars → fallback
      if (!filename || /^[\d\-_]+$/.test(filename)) {
         // Try to guess extension from URL pattern or MIME type
         if (isPDF(fileOrUrl)) return `${fallbackName}.pdf`;
         if (isImage(fileOrUrl)) return `${fallbackName}.jpg`;
         return `${fallbackName}`;
      }

      // Add extension if missing
      if (!/\.[a-z0-9]{2,4}$/i.test(filename)) {
         if (isPDF(fileOrUrl)) return `${filename}.pdf`;
         if (isImage(fileOrUrl)) return `${filename}.jpg`;
      }

      return filename;
   } catch {
      // Not a valid URL, could be just a filename
      if (isPDF(fileOrUrl)) return `${fallbackName}.pdf`;
      if (isImage(fileOrUrl)) return `${fallbackName}.jpg`;
      return `${fallbackName}`;
   }
}



// Get file extension from File or URL
export function getFileExtension(fileOrUrl: File | string | null | undefined): string {
   const filename = getFileNameFromFileOrUrl(fileOrUrl, "document");
   const match = filename.match(/\.([a-z0-9]{2,4})$/i);
   return match ? match[1].toUpperCase() : "FILE";
}