const mongoose = require('mongoose');

const borrowedUserSchema = new mongoose.Schema({
  cart: [{
    book: {
      _id: String,
      bookTitle: String,
      authorName: String,
      // Add other properties of the book as needed
    },
    borrower: {
      userId: String,
      fullName: String,
      email: String,
      phoneNo: String,
      role: String,
    },
    checkoutForm: {
      borrowDate: Date,
      returnDate: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'overdue'],
      default: 'pending'
    }
  }],
  history: [{
    _id: String,
    bookTitle: String,
    authorName: String,
    borrowDate: Date,
    returnDate: Date
    // Add other properties as needed
  }]
});

module.exports = mongoose.model('BorrowersUser', borrowedUserSchema);
