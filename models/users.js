const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { usersRegister } = require('../controllers/usersController');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    staffNo: { type: String, maxlength: 7, unique: true },
    admissionNo: { type: String, maxlength: 11, unique: true },
    department: { type: String, required: true },
    phoneNo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: [6, 'Password must have at least 6 characters'], maxlength: 255 },
    role: { 
        type: String, 
        enum: ['staff', 'student', 'admin'], 
        default: 'student', 
        required: true 
    },
    passwordChangeAt: Date,
    passwordResetToken: {type: String},
    passwordResetTokenExpires: Date,
});

// Ensure either staffNo or admissionNo is provided based on the role
userSchema.pre('validate', function(next) {
    if (this.role === 'staff' && !this.staffNo) {
        return next(new Error('Staff number is required for staff.'));
    }
    if (this.role === 'student' && !this.admissionNo) {
        return next(new Error('Admission number is required for student.'));
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
// Generate and set a token for password reset
userSchema.methods.sendPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expiration time
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    // Save the updated user
    return resetToken;
};

const User = mongoose.model("Users", userSchema);

module.exports = User;
