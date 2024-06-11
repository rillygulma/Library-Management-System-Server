const mongoose = require('mongoose');

const advanceSearchSchema = new mongoose.Schema({
    bookTitle: {
        type: String,
        required: true
    },
    bookBarcode: {
        type: Number,
        required: true
    },
    placeOfPub: {
        type: String,
        required: true
    },
    yearPublished: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('AdvanceSearch', advanceSearchSchema);