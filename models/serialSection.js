const mongoose = require('mongoose');

const serialSectionSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    bookTitle: {
        type: String,
        required: true
    },
    bookBarcode: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Serial', serialSectionSchema);s