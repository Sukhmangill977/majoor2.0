import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import { uploadFileToFirebase } from '../utils/uploadToFirebase.js';

// Test function
export const test = (req, res) => {
  res.status(200).send("User routes are working!");
};

// Update user
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only update your own account!'));
  }
  try {
    const updates = {
      username: req.body.username,
      email: req.body.email,
      profilePicture: req.body.profilePicture,
    };

    if (req.body.password) {
      updates.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    console.error("Error in updateUser:", error);
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only delete your own account!'));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json('User has been deleted.');
  } catch (error) {
    console.error("Error in deleteUser:", error);
    next(error);
  }
};

// Upload PDF
// Upload PDF and update the user's pdfUrls array
export const uploadUserPdf = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only upload PDFs for your own account!'));
  }

  try {
    const { downloadURL } = req.body; // The download URL sent from the frontend
    const userId = req.user.id;

    // Update the user document by pushing the download URL into the pdfUrls array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { pdfUrls: downloadURL } },
      { new: true }
    );

    res.status(200).json({
      message: 'PDF uploaded successfully.',
      pdfUrls: updatedUser.pdfUrls, // Return the updated list of PDF URLs
    });
  } catch (error) {
    console.error('Error in uploadUserPdf:', error);
    next(error);
  }
};

