const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/errorResponse');
const Books = require('../models/booksModels.js');

// Books Upload
exports.uploadBooks = async (req, res, next) => {
    try {
        const book = await Books.create(req.body);
        res.status(201).json({ success: true, data: book });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get all books
exports.allbooks = async (req, res) => {
    try {
        // Check if a search query parameter is provided
        const searchQuery = req.query.q;

        let books;
        // If search query exists, filter books based on the query
        if (searchQuery) {
            books = await Books.find({ $text: { $search: searchQuery } });
        } else {
            // If no search query provided, return all books
            books = await Books.find();
        }
        
        res.status(200).json({ success: true, data: books });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// Get a single book
exports.singlebook = async (req, res) => {
    try {
        const book = await Books.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.status(200).json({ success: true, data: book });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Book by status
exports.getBookByStatus = async (req, res) => {
    try {
      const book = await Books.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ status: book.status });
    } catch (error) {
      console.error('Error fetching book status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// Update a book
exports.updatebook = async (req, res) => {
    try {
        const book = await Books.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.status(200).json({ success: true, data: book, message: "sucessfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete a book
exports.deletebook = async (req, res) => {
    try {
        const book = await Books.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
