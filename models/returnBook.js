const mongoose = require('mongoose');

const returnedBookSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    bookId: {
        type: String,
        required: true
    },
    
    bookTitle: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    returnDate: {
      type: Date,
      required: true,
    }
});

module.exports = mongoose.model('ReturnedBook', returnedBookSchema);