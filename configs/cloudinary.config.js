const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Correct import
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define allowed formats
const allowedFormats = ['jpg', 'png', 'jpeg'];

// Configure Cloudinary storage
const storage = (folder, options = {}) =>
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      format: (req, file) => {
        const extension = file.originalname.split('.').pop();
        if (allowedFormats.includes(extension)) {
          return extension;
        } else {
          throw new Error('Invalid file format');
        }
      },
      public_id: (req, file) => file.originalname.split(".")[0],
      transformation: [
        { 
          width: options.width || 800,
          height: options.height || 800,
          crop: options.crop || 'fill',
          gravity: options.gravity || 'auto',
          quality: options.quality || 'auto',
          fetch_format: 'auto'
        }
      ]
    },
  });

module.exports = storage;
