const UserRegister = require('../models/users.js');
const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/errorResponse.js');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// User Registration
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

// Generate Token
const generateToken = async(user) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1h'});
    return token;
}

// Get all users
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

// Update user details
exports.updateUser = async (req, res, next) => {
    try {
        const user = await UserRegister.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// Delete a user
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await UserRegister.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// User Login
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
        const accessToken = await generateToken({ user: user });

        // Respond with token
        res.status(200).json({
            success: true,
            msg: 'Login Successfully',
            data: user,
            accessToken: accessToken,
            tokenType: 'Bearer'
        });
    } catch (err) {
        return next(err); // Forward the error to the error handling middleware
    }
}

// Request Password Reset
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
        const resetUrl = `Reset Token copy and paste it: ${resetToken}`;
        const mailOptions = {
            from: process.env.gmailUsername,
            to: email,
            subject: 'Password Reset Token',
            text: `We have received a password reset request. Please use the below reset token for your password reset.\n\n${resetUrl}\n\n The token is valid for 10mins`
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
        const user = await UserRegister.findOne({ passwordResetToken: token });

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
}

// Borrow a book
exports.borrowBook = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const cartItems = req.body;

        const user = await UserRegister.findById(userId);
        if (!user) return res.status(404).send('User not found');

        cartItems.forEach(item => {
            user.cart.push({
                borrowedBookId: item.borrowedBookId,
                bookTitle: item.bookTitle,
                authorName: item.authorName,
                checkoutForm: { 
                    borrowDate: new Date(),
                    returnDate: new Date(item.returnDate)
                }
            });
        });

        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.returnBook = async (req, res, next) => {
    try {
        const { userId, bookId } = req.params;
        const { returnDate } = req.body;

        const user = await UserRegister.findById(userId);
        if (!user) return res.status(404).send('User not found');

        const book = await user.returnBook(bookId, returnDate);
        if (!book) return res.status(404).send('Book not found or not borrowed by user');

        res.status(200).json({ message: 'Book returned successfully', user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Accept a returned book (Admin action)
exports.acceptReturnBook = async (req, res, next) => {
    try {
      const { userId, bookId } = req.params;
      const user = await UserRegister.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const bookIndex = user.history.findIndex(book => 
        book.borrowedBookId.toString() === bookId && book.status === 'accepted'
      );
  
      if (bookIndex === -1) {
        return res.status(404).send('Book not found or not returned');
      }
  
      user.history[bookIndex].status = 'returned';
      await user.save();
  
      res.status(200).send(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  // Accept Borrow Book
exports.acceptBorrowBook = async (req, res, next) => {
    try {
      const { userId, bookId } = req.params;
      const { status } = req.body;
  
      // Check if userId or bookId is undefined
      if (!userId || !bookId) {
        return res.status(400).send('User ID or Book ID is missing');
      }
  
      const user = await UserRegister.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const bookIndex = user.cart.findIndex(book =>
        book.borrowedBookId.toString() === bookId
      );
  
      if (bookIndex === -1) {
        return res.status(404).send('Book not found in cart');
      }
  
      user.cart[bookIndex].status = status;
      if (status === 'accepted') {
        user.cart[bookIndex].isBorrowed = true;
      }
  
      await user.save();
  
      res.status(200).send(user);
    } catch (error) {
      console.error('Error accepting book return:', error);
      res.status(500).send(error.message);
    }
  };

// Request a renewal
exports.requestRenewal = async (req, res, next) => {
    try {
      const { userId, bookId } = req.params;
      const { newReturnDate, role, fullName, email, staffNo, admissionNo } = req.body;
  
      const user = await UserRegister.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Check role and assign either staffNo or admissionNo
      if (role === 'staff' && !staffNo) {
        return res.status(400).send('Staff number is required for staff.');
      } else if (role === 'student' && !admissionNo) {
        return res.status(400).send('Admission number is required for students.');
      }
  
      await user.requestRenewal(bookId, newReturnDate, role, fullName, email, staffNo, admissionNo);
      res.status(200).send(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  

// Accept a renewal request (Admin action)
exports.acceptRenewal = async (req, res) => {
    const { userId, bookId, newReturnDate } = req.body;

    if (!userId || !bookId || !newReturnDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const user = await UserRegister.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const cartIndex = user.cart.findIndex(book => book.borrowedBookId.toString() === bookId.toString());
  
      if (cartIndex === -1) {
        return res.status(404).json({ message: 'Book not found in cart' });
      }
  
      if (user.cart[cartIndex].renewalStatus !== 'requested') {
        return res.status(400).json({ message: 'Renewal request not found for this book' });
      }
  
      user.cart[cartIndex].checkoutForm.returnDate = newReturnDate;
      user.cart[cartIndex].renewalStatus = 'renewed';
      user.cart[cartIndex].status = 'renewed';
  
      await user.save();
  
      res.status(200).json({ message: 'Renewal status updated successfully', cart: user.cart[cartIndex] });
    } catch (error) {
      console.error('Error updating renewal status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }  
  };
  



// Get all return book requests (Admin action)
exports.getAllReturnRequests = async (req, res, next) => {
    try {
        const users = await UserRegister.find({ 'cart.borrowedBookId': { $exists: true } })
            .populate('cart.borrowedBookId', 'title author') // Adjust fields as per the Books schema
            .select('-password -__v'); // Exclude sensitive fields
    
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all renewal requests (Admin action)
exports.getAllRenewalRequests = async (req, res, next) => {
    try {
        const users = await UserRegister.find({ 'cart.renewalStatus': 'requested' });
        const renewalRequests = users.map(user => ({
            userId: user._id,
            cart: user.cart.filter(book => book.renewalStatus === 'requested')
        }));
        res.status(200).send(renewalRequests);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

// Controller to get user cart
    exports.getUserCart = async (req, res) => {
    try {
      const userId = req.params.id; // Assuming the user ID is provided in the request parameters
      const user = await UserRegister.findById(userId).select('cart').populate('cart.borrowedBookId', 'bookTitle authorName');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user.cart);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  // Checking Borrowing Eligibility
  exports.checkBorrowingEligibility = async (req, res, next) => {
    const { userId } = req.params;
  
    try {
      const user = await UserRegister.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      if (user.isBorrowed) {
        return res.status(403).send('User cannot borrow a book again');
      }
      
      res.status(200).send('User can borrow a book'); // Adjust the response as per your needs
  
    } catch (error) {
      console.error('Error checking borrowing eligibility:', error);
      res.status(500).send(error.message);
    }
  };

  // Accepting Return Book Request
  exports.acceptBorrowedBookReturn = async (req, res, next) => {
    try {
        const { userId, bookId } = req.params;
        const { status } = req.body;
    
        // Check if userId or bookId is undefined
        if (!userId || !bookId) {
          return res.status(400).send('User ID or Book ID is missing');
        }
    
        const user = await UserRegister.findById(userId);
        if (!user) {
          return res.status(404).send('User not found');
        }
    
        const bookIndex = user.cart.findIndex(book =>
          book.borrowedBookId.toString() === bookId
        );
    
        if (bookIndex === -1) {
          return res.status(404).send('Book not found in cart');
        }
    
        user.cart[bookIndex].status = status;
        if (status === 'returned') {
          user.cart[bookIndex].isBorrowed = false;
        }
    
        await user.save();
    
        res.status(200).send(user);
      } catch (error) {
        console.error('Error accepting book return:', error);
        res.status(500).send(error.message);
      }
    };
