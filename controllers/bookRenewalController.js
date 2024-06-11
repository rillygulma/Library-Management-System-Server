const BookRenewal = require('../models/bookRenewal');

// Get all book renewals
exports.getAllBookRenewals = async (req, res) => {
    try {
        const bookRenewals = await BookRenewal.find();
        res.status(200).json(bookRenewals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single book renewal by ID
exports.getBookRenewalById = async (req, res) => {
    try {
        const bookRenewal = await BookRenewal.findById(req.params.id);
        if (!bookRenewal) {
            return res.status(404).json({ message: 'Book renewal not found' });
        }
        res.status(200).json(bookRenewal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new book renewal
exports.createBookRenewal = async (req, res) => {
    const { email, borrowerId, bookTitle, role } = req.body;
    const newBookRenewal = new BookRenewal({ email, borrowerId, bookTitle, role });
    try {
        const savedBookRenewal = await newBookRenewal.save();
        res.status(201).json(savedBookRenewal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a book renewal by ID
exports.updateBookRenewal = async (req, res) => {
    try {
        const updatedBookRenewal = await BookRenewal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBookRenewal) {
            return res.status(404).json({ message: 'Book renewal not found' });
        }
        res.status(200).json(updatedBookRenewal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a book renewal by ID
exports.deleteBookRenewal = async (req, res) => {
    try {
        const deletedBookRenewal = await BookRenewal.findByIdAndDelete(req.params.id);
        if (!deletedBookRenewal) {
            return res.status(404).json({ message: 'Book renewal not found' });
        }
        res.status(200).json({ message: 'Book renewal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a single book renewal
exports.deleteSingleRenewal = async (req, res) => {
    const { id } = req.body;
    try {
        await BookRenewal.deleteOne({ _id: id }); 
        res.status(200).json({ message: 'Book renewal Accepted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};