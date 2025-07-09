const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async(filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        return {
            url: secure_url, 
            publicId: public_id
        }
    } catch (error) {
        console.log('Error while uploading to cloudinary', error); 
        throw new Error('Error while uploading to cloudinary');
    }
}