import multer from 'multer';
import path from 'path';

// Define storage configuration for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where files will be saved
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Define the filename with a timestamp to avoid name collisions
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create an instance of multer with file size limit and filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Set maximum file size to 10MB
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'), false);
    }
  }
});

export default upload;
