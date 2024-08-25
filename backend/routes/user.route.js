import express from 'express';
import {
  test,
  updateUser,
  deleteUser,
  uploadUserPdf,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import upload from '../utils/multerConfig.js'; // Import multer config

const router = express.Router();

// Test route
router.get('/', test);

// Update user route with authentication
router.post('/update/:id', verifyToken, updateUser);

// Delete user route with authentication
router.delete('/delete/:id', verifyToken, deleteUser);

// Route for handling PDF uploads with authentication and file handling
router.post('/upload/pdf/:id', verifyToken, upload.single('pdfFile'), uploadUserPdf);


export default router; // Ensure this line is present
