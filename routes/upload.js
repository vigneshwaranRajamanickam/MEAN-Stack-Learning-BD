const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mean-stack-pos', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: Resize
  }
});

const upload = multer({ storage: storage });

// Upload Endpoint
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file type' });
  }
  console.log(req,'requrest');
  
  // Cloudinary returns the URL in `path` or `secure_url`
  res.json({
    message: 'File Uploaded to Cloudinary!',
    filePath: req.file.path // Cloudinary URL
  });
});

module.exports = router;
