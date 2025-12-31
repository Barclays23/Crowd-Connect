// ============================= FOR STORING IN CLOUDINARY ===============================
import multer from 'multer';



// Configure Multer storage
const memoryStorage = multer.memoryStorage(); // Use memory storage since we'll upload to Cloudinary


interface MulterFile {
   fieldname: string;
   originalname: string;
   encoding: string;
   mimetype: string;
   size: number;
   buffer: Buffer;
}

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const DOCUMENT_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  'application/pdf',
];




// ─── file type checkers ───────────────────────────────────
const isImage = (mimetype: string) => IMAGE_MIME_TYPES.includes(mimetype);
const isDocument = (mimetype: string) => DOCUMENT_MIME_TYPES.includes(mimetype);



export const uploadImage = multer({
   storage: memoryStorage,
   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
   fileFilter: (req, file, cb) => {
      if (isImage(file.mimetype)) {
         cb(null, true);
      } else {
         cb(new Error('Only JPEG, PNG, GIF, WEBP images allowed'));
      }
   },
});


export const uploadDocument = multer({
   storage: memoryStorage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
   fileFilter: (req, file, cb) => {
      if (isImage(file.mimetype) || isDocument(file.mimetype)) {
         cb(null, true);
      } else {
         cb(new Error('Only images (JPEG/PNG/GIF/WEBP) or PDF allowed'));
      }
   },
});









// ============================= FOR STORING IN LOCAL STORAGE ===============================
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';


// // Setup __dirname manually for ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


// // Folder to save profile images
// const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'profile-pics'); // local folder fath / name


// // Ensure folder exists
// if (!fs.existsSync(folderPath)) {
//   fs.mkdirSync(folderPath, { recursive: true });
// }

// // Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, folderPath);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = path.basename(file.originalname, ext);
//     cb(null, `${name}-${Date.now()}${ext}`);
//   },
// });

// // Initialize Multer with storage configuration
// const upload = multer({ storage });

// export default upload;