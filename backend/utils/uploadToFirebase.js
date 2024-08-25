import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Update this path to match the location of your service account key
const serviceAccount = path.join(__dirname, 'serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'your-project-id.appspot.com' // Replace with your bucket name
});

const bucket = getStorage().bucket();

export const uploadFileToFirebase = async (file, userId) => {
  const filePath = path.join(__dirname, '..', 'uploads', file.filename);

  await bucket.upload(filePath, {
    destination: `user-uploads/${userId}/${file.filename}`,
    metadata: {
      contentType: file.mimetype,
    },
  });

  const fileUrl = `https://storage.googleapis.com/${bucket.name}/user-uploads/${userId}/${file.filename}`;
  fs.unlinkSync(filePath); // Remove file from local storage after upload

  return fileUrl;
};
