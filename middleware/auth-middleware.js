const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeaders = req.headers['authorization']; 
    const token = authHeaders && authHeaders.split(" ")[1]; 

    if(!token) {
        return res.status(401).json({
            success: false, 
            message: 'Access denied. No token provided! Please login to continue.'
        });
    }
    //decode the token 
    try {
        const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userInfo = decodedTokenInfo; 
        next();
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!', 
            error: error.message
        });
    }
}

module.exports = authMiddleware;