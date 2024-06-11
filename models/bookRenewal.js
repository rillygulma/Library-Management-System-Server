const mongoose = require('mongoose');

const bookRenewalSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    borrowerId: {
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
    }
});

module.exports = mongoose.model('BookRenewal', bookRenewalSchema);