const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ims/products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        public_id: (req, file) => {
            const timestamp = Date.now();
            const name = file.originalname.split('.')[0].replace(/\s+/g, '-');
            return `${name}-${timestamp}`;
        },
    },
});

module.exports = {
    cloudinary,
    storage,
};
