const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'PINCH_DEV',
      allowedFormats: ['jpeg', 'png', 'jpg'],
    },
  });

module.exports = { cloudinary, storage };