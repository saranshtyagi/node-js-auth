const Image = require('../models/Image'); 
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper');

const uploadImage = async(req, res) => {
    try {
        if(!req.file) {
            res.status(400).json({
                success: false, 
                message: 'File is missing, file is required!'
            });
        }

        const { url, publicId } = await uploadToCloudinary(req.file.path);

        const newlyUploadedImage = await Image.create({
            url,
            publicId, 
            uploadedBy: req.userInfo.userId
        });

        if(!newlyUploadedImage) {
            res.status(400).json({
                success: false, 
                message: "Could not upload image!"
            });
        }
        res.status(201).json({
            success: true, 
            message: 'Image uploaded successfully!', 
            image: newlyUploadedImage
        });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!'
        });
    }
}

module.exports = uploadImage;