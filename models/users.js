const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { type } = require('os');

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  staffNo: {
    type: String,
    maxlength: 7,
    unique: true,
    sparse: true, // Allow null or undefined
  },
  admissionNo: {
    type: String,
    maxlength: 11,
    unique: true,
    sparse: true, // Allow null or undefined
  },
  department: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must have at least 6 characters'],
    maxlength: 255,
  },
  role: {
    type: String,
    enum: ['staff', 'student', 'admin'],
    default: 'student',
    required: true,
  },
  cart: [{
    borrowedBookId: {
      type: Schema.Types.ObjectId,
      ref: 'Books',
      required: true,
    },
    checkoutForm: {
      borrowDate: {
        type: Date,
        default: Date.now,
      },
      returnDate: {
        type: Date,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'returned', 'renewed'],
      default: 'pending',
      required: true,
    },
    isBorrowed: {
      type: Boolean,
      default: false,
    },
    isRenewed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
    },
    fullName:{
      type: String,
    },
    staffNo:{

    },
    admissionNo:{
      type: String,
    },
    bookTitle: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    renewalRequestDate: {
      type: Date,
    },
    renewalStatus: {
      type: String,
      enum: ['requested', 'renewed', 'rejected'],
      default: null,
    },
  }],
  history: [{
    borrowedBookId: {
      type: Schema.Types.ObjectId,
      ref: 'Books',
      required: true,
    },
    checkoutForm: {
      borrowDate: {
        type: Date,
        default: Date.now,
      },
      returnDate: {
        type: Date,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'returned', 'renewed'],
      default: 'pending',
      required: true,
    },
    isBorrowed: {
      type: Boolean,
      default: false,
    },
    isRenewed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
    },
    fullName:{
      type: String,
    },
    staffNo:{

    },
    admissionNo:{
      type: String,
    },
    bookTitle: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
  }],
  passwordChangeAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
});

// Ensure either staffNo or admissionNo is provided based on the role
UserSchema.pre('validate', function(next) {
  if (this.role === 'staff' && !this.staffNo) {
    return next(new Error('Staff number is required for staff.'));
  }
  if (this.role === 'student' && !this.admissionNo) {
    return next(new Error('Admission number is required for students.'));
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
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
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and set a token for password reset
UserSchema.methods.sendPasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  return resetToken;
};

// Update isBorrowed based on history
UserSchema.methods.updateIsBorrowedFromHistory = async function() {
  const hasAcceptedBookInHistory = this.history.some(book => book.status === 'accepted');
  this.isBorrowed = hasAcceptedBookInHistory;
  return this.save();
};

// Return a book
UserSchema.methods.returnBook = function(bookId) {
  const cartIndex = this.cart.findIndex(book => book.borrowedBookId.toString() === bookId.toString());
  if (cartIndex !== -1) {
    const book = this.cart[cartIndex];
    book.status = 'processing';
    return this.save();
  }
  return Promise.reject(new Error('Book not found in cart'));
};

// Accept a returned book (Admin action)
UserSchema.methods.acceptReturnBook = async function(bookId) {
    const cartIndex = this.cart.findIndex(book => book.borrowedBookId.toString() === bookId.toString() && book.status === 'returned');
    if (cartIndex !== -1) {
      this.cart[cartIndex].status = 'returned'; // Update status in cart
      this.history.push(this.cart[cartIndex]); // Move to history
      this.cart.splice(cartIndex, 1); // Remove from cart
      return this.save();
    }
    return Promise.reject(new Error('Book not found in return cart or not returned'));
  };
  
// Request a renewal
UserSchema.methods.requestRenewal = function(bookId, newReturnDate, role, fullName, email, staffNo) {
  const cartIndex = this.cart.findIndex(book => book.borrowedBookId.toString() === bookId.toString());
  if (cartIndex !== -1) {
    // Ensure the request is made by the appropriate role
    if ((role === 'staff' && this.staffNo === staffNo) || (role === 'student' && this.admissionNo === admissionNo)) {
      this.cart[cartIndex].renewalRequestDate = newReturnDate;
      this.cart[cartIndex].renewalStatus = 'requested';
      this.role = role; // Update user's role if needed
      this.fullName = fullName; // Update user's full name if needed
      this.email = email; // Update user's email if needed
      this.staffNo = staffNo; // Update staff number if needed
      return this.save();
    } else {
      return Promise.reject(new Error('Unauthorized request for renewal.'));
    }
  }
  return Promise.reject(new Error('Book not found in cart'));
};

// Accept a renewal request (Admin action)
UserSchema.methods.acceptRenewal = async function(bookId) {
  const cartIndex = this.cart.findIndex(book =>
    book.borrowedBookId.toString() === bookId.toString() &&
    book.renewalStatus === 'requested'
  );

  console.log('Cart Index:', cartIndex);

  if (cartIndex !== -1) {
    this.cart[cartIndex].checkoutForm.returnDate = this.cart[cartIndex].renewalRequestDate;
    this.cart[cartIndex].renewalStatus = 'accepted';
    this.cart[cartIndex].status = 'renewed';
    console.log('Updated Cart:', this.cart[cartIndex]);
    return await this.save();
  }

  console.log('Renewal request not found for this book');
  return Promise.reject(new Error('Renewal request not found for this book'));
};

module.exports = mongoose.model('User', UserSchema);
