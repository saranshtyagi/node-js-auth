const uploadImage = async(req, res) => {
    try {
        if(!req.file) {
            res.status(400).json({
                success: false, 
                message: 'File is missing, file is required!'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!'
        });
    }
}