import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'https://i.pinimg.com/736x/3b/ed/41/3bed41ea8eeaab4fbdc572d2a0ba9cb6.jpg' }, // Set default value for profile picture
  pdfUrls: [{ type: String }], // Array of PDF URLs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const User = mongoose.model('User', userSchema);

export default User;
