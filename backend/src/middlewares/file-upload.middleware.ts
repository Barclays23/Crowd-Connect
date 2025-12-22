// ============================= FOR STORING IN CLOUDINARY ===============================
import multer from 'multer';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';


// Configure Multer storage
const storage = multer.memoryStorage(); // Use memory storage since we'll upload to Cloudinary

// File filter to allow only images
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

const fileFilter = (
    req: Request,
    file: MulterFile,
    cb: FileFilterCallback
): void => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed'));
    }
};


// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: fileFilter,
});

export default upload;




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