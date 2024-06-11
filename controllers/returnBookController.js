const ReturnedBook = require('../models/returnBook');

// Create a returned book entry
exports.returnBookRequest = async (req, res) => {
    try {
        const { bookId, bookTitle, role, returnDate } = req.body;
        const returnedBook = new ReturnedBook({ bookId, bookTitle, role, returnDate });
        await returnedBook.save();
        res.status(201).json(returnedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all returned books
exports.allReturnBookRequest = async (req, res) => {
    try {
        const returnedBooks = await ReturnedBook.find();
        res.status(200).json(returnedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single returned book by ID
exports.singleReturnBookRequest = async (req, res) => {
    try {
        const returnedBook = await ReturnedBook.findById(req.params.id);
        if (!returnedBook) {
            return res.status(404).json({ message: 'Returned book not found' });
        }
        res.status(200).json(returnedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a returned book by ID
exports.updateReturnBookRequest = async (req, res) => {
    try {
        const { bookId, bookTitle, role, returnDate } = req.body;
        const returnedBook = await ReturnedBook.findByIdAndUpdate(
            req.params.id,
            { bookId, bookTitle, role, returnDate },
            { new: true, runValidators: true }
        );
        if (!returnedBook) {
            return res.status(404).json({ message: 'Returned book not found' });
        }
        res.status(200).json(returnedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a returned book by ID
exports.deleteReturnBookRequest = async (req, res) => {
    try {
        const returnedBook = await ReturnedBook.findByIdAndDelete(req.params.id);
        if (!returnedBook) {
            return res.status(404).json({ message: 'Returned book not found' });
        }
        res.status(200).json({ message: 'Returned book deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
