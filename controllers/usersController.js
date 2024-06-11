const UserRegister = require('../models/users.js');
const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/errorResponse.js');
const  jwt = require('jsonwebtoken');
const Books = require('../models/booksModels.js');
const BorrowersUser = require('../models/borrowedBook.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const  createPasswordResetToken = require('../models/users')
const crypto = require('crypto');

exports.usersRegister = async (req, res, next) => {
    const { email } = req.body;

    try {
        // Check if user already exists
        const userExist = await UserRegister.findOne({ email });
        if (userExist) {
            return next(new ErrorResponse("Email already registered", 400));        
        }

        // Create user
        const newUser = await UserRegister.create(req.body);

        // Return the created user data in the response
        res.status(201).json({
            success: true,
            user: newUser // Include the created user data in the response
        });
    } catch (error) {
        next(error);
    }
}

const generateToken = async(user) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1h'});
    return  token;

}

//Get all users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await UserRegister.find();
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
}

// Get a single user by ID
exports.getUserById = async (req, res, next) => {
    try {
        const user = await UserRegister.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// UPDATE - Update user details
exports.updateUser = async (req, res, next) => {
    try {
        const user = await UserRegister.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


// DELETE - Delete a user
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await Books.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }
        await user.remove();
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}


exports.userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return next(new ErrorResponse("Please provide email and password", 400));
        }

        // Check User email
        const user = await UserRegister.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        // Check Password
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        // Generate JWT token
        const accessToken =  await generateToken({user: user})

        // Respond with token 
        res.status(200).json({
            success: true,
            msg: 'Login Successfuly',
            data: user,
            accessToken: accessToken,
            tokenType: 'Bearer'
        });
    } catch (err) {
        return next(err); // Forward the error to the error handling middleware
    }
};

// Request Reset Password
exports.requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await UserRegister.findOne({ email });
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }

        // Generate token for password reset
        const resetToken = await user.sendPasswordResetToken(); // Await the method call
        await user.save();

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: process.env.gmailUsername,
                pass: process.env.gmailPassword
            },
            authMethod: 'login' // Specify the authentication method
        });

        // Email message
        const resetUrl = `Reset Token copy and paste it: ${resetToken}`
        const mailOptions = {
            from: process.env.gmailUsername,
            to: email,
            subject: 'Password Reset Token',
            text: `We have received a password reset request. Please use the below reset token for  your password Reset.\n\n${resetUrl} \n\n The token valid for 10mins`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return next(new ErrorResponse("Error sending email", 500));
            }
            console.log('Email sent:', info.response);
        });

        res.status(200).json({
            success: true,
            message: "Password reset token sent to email"
        });
    } catch (error) {
        next(error);
    }
}
// Reset Password
exports.resetPassword = async (req, res, next) => {
    try {
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await UserRegister.findOne({ passwordResetToken: token});
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Set the new password and reset token
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;

        // Save the updated user object
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        // Handle errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: "Token expired"
            });
        } else {
            return next(error);
        }
    }
};
