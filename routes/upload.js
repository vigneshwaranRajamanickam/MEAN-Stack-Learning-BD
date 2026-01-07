const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage (Memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload Endpoint
router.post('/', upload.single('image'), (req, res) => {
  console.log(req.body, res)
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file type' });
  }

  // Determine folder name from request body or default
  let folderName = 'mean-stack-pos';
  if (req.body.storeName) {
    // Sanitize folder name: replace non-alphanumeric chars with underscore, trim
    folderName = req.body.storeName.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'mean-stack-pos';
  }

  // Create a stream upload to Cloudinary
  const uploadOptions = {
    folder: folderName,
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  };

  // If a file name is provided, use it as the public_id
  if (req.body.fileName) {
    // Sanitize file name
    const cleanFileName = req.body.fileName.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '');
    if (cleanFileName) {
      uploadOptions.public_id = cleanFileName;
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = false; // Don't add random chars
    }
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    uploadOptions,
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).json({ message: 'Cloudinary Upload Error', error });
      }
      res.json({
        message: 'File Uploaded to Cloudinary!',
        filePath: result.secure_url
      });
    }
  );

  // Convert buffer to stream and pipe to Cloudinary
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);
  bufferStream.pipe(uploadStream);
});

module.exports = router;
