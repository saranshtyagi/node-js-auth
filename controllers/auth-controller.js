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

module.exports = {
    registerUser, 
    loginUser
}