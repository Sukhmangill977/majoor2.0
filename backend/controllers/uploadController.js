// backend/controllers/uploadController.js
import User from '../models/User.js';
import { uploadFileToFirebase } from '../utils/uploadToFirebase.js'; // Adjust path as needed

export const uploadPdf = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming you get the userId from params
    const file = req.file; // Assuming you use multer or similar to handle file uploads

    // Upload the PDF to Firebase
    const fileUrl = await uploadFileToFirebase(file, userId);

    // Update user document with PDF URL
    await User.findByIdAndUpdate(
      userId,
      { $push: { pdfUrls: fileUrl } },
      { new: true }
    );

    res.status(200).json({ message: 'PDF uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
