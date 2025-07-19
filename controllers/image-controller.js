const Image = require('../models/Image'); 
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper');
const cloudinary = require('../config/cloudinary');
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

const fetchImageController = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit; 
        const sortBy = req.query.sortBy || 'createdAt'; 
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments(); 
        const totalPages = Math.ceil(totalImages/limit);

        const sortObj = {}; 
        sortObj[sortBy] = sortOrder;

        const images = await Image.find().sort(sortObj).skip(skip).limit(limit); 

        if(images) {
            res.status(200).json({
                success: true, 
                currentPage: page,
                totalPages, 
                totalImages,
                data: images
            });
        }
        res.status(400).json({
            success: false, 
            message: "No images found!"
        })
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!',
            error: error.message
        });
    }
}

const deleteImageController = async(req, res) => {
    try {
        const idOfImageToBeDeleted = req.params.id; 
        const userId = req.userInfo.userId; 
        const image = await Image.findById(idOfImageToBeDeleted); 

        if(!image) {
            return res.status(404).json({
                success: false, 
                message: 'Image not found!'
            });
        }

        //check if the image is being deleted by the same user which is the current user, who uploaded the image.
        if(image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false, 
                message: 'You are not authorized to perform this action'
            });
        }

        //delete the image first from cloudinary then from mongoDB to avoid creating orphaned file in cloudinary 
        await cloudinary.uploader.destroy(image.publicId); 
        await Image.findByIdAndDelete(idOfImageToBeDeleted); 

        res.status(200).json({
            success: true, 
            message: 'Image deleted successfully!'
        });

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!',
            error: error.message
        });
    }
}

module.exports = {
    uploadImageController, 
    fetchImageController, 
    deleteImageController
};