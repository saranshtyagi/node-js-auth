const Image = require('../models/Image'); 
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper');
// const fs = require('fs');

const uploadImageController = async(req, res) => {
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

        // delete the image from local storage
        // fs.unlinkSync(req.file.path) 

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
            message: 'Something went wrong. Please try again!',
            error: error.message
        });
    }
}

module.exports = uploadImageController;