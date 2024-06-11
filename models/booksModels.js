const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema({
    authorName: { 
        type: String, 
        required: true
    },
    bookTitle: { 
        type: String, 
        required: true 
    },
    PlaceOfPub: {
        type: String, 
        required: true
    },
    publisher:{
        type: String, 
        required: true
    },
    yearPublished: {
        type: String, 
        required: true
    },
    isbn: {
        type: String,
        required: true,
        maxLength: 13,
        unique: true
    },
    bookImageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    edition: {
        type: String,
        required: true
    },
    bookDescription: {
        type: String,
        maxLength: 1024,
        required: true
    },
    other:{
        type: String,
    },
    bookBarcode: {
        type: String,
        barcode: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['available', 'pending', 'borrowed'],
        default: "available"
    }

});

module.exports = mongoose.model('Books', booksSchema);