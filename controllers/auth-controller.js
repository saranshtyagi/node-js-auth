require("dotenv").config();
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async(req, res) => {
    try {
        const { username, email, password, role } = req.body; 
        const checkExistingUser = await User.findOne({$or: [{username}, {email}]}); 

        if(checkExistingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists', 
            });
        }
        
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newlyCreatedUser = await User.create({
            username, 
            email, 
            password: hashedPassword, 
            role: role || 'user'
        });
        
        if(!newlyCreatedUser) {
            res.status(400).json({
                success: false, 
                message: 'User could not be registered', 
            });
        }
        res.status(201).json({
            success: true, 
            message: 'User registered successfully', 
            data: newlyCreatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong.Please try again!', 
            error: error.message
        });
    }
}

const loginUser = async(req, res) => {
    try {
        const { username, password } = req.body; 
        const user = await User.findOne({ username }); 

        if(!user) {
            res.status(400).json({
                success: false, 
                message: "User doesn't exist!"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password); 

        if(!isPasswordMatch) {
            res.status(400).json({
                success: false, 
                message: "Incorrect username or password"
            });
        }

        const accessToken = jwt.sign({
            userId: user._id, 
            username: user.username, 
            role: user.role
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: '15m'
        });

        res.status(200).json({
            success: true, 
            message: 'Logged in successfully', 
            accessToken
        });

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!', 
            error: error.message
        });
    }
}

const changePassword = async(req, res) =>{
    try {
        const userId = req.userInfo.userId; 
        
        //from the frontend, extract old and new password entered. also to check if both old and new are same, do it in frontend rather than in backend
        const { oldPassword, newPassword } = req.body; 

        const user = await User.findById(userId); 

        if(!user) {
            return res.status(400).json({
                success: false, 
                message: "User doesn't exist!"
            });
        }

        //check if the user has entered the same old password stored in database or not. 
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if(!isPasswordMatch) {
            return res.status(400).json({
                success: false, 
                message: 'Old password entered is wrong!'
            });
        }

        //hash the new password before storing in db
        const salt = await bcrypt.genSalt(10); 
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        
        //update password
        user.password = hashedNewPassword; 
        await user.save();

        res.status(200).json({
            success: true, 
            message: 'Password changed successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Something went wrong. Please try again!',
            error: error.message
        })
    }
}


module.exports = {
    registerUser, 
    loginUser, 
    changePassword
}