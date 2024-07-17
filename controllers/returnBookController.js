const ReturnedBook = require('../models/returnBook');



// Create a returned book entry
exports.returnBookRequest = async (req, res) => {
    try {
        const { email, userId, bookId, bookTitle, role, returnDate } = req.body;
    
        // Validate request data
        if (!email || !userId || !bookId || !bookTitle || !role || !returnDate) {
          return res.status(400).json({ error: 'All fields are required' });
        }
    
        // Create a new returned book document
        const returnedBook = new ReturnedBook({
          email,
          userId,
          bookId,
          bookTitle,
          role,
          returnDate
        });
    
        // Save the document to the database
        await returnedBook.save();
    
        res.status(201).json(returnedBook);
      } catch (error) {
        console.error('Error creating return book request:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
    

// Get all returned books
exports.allReturnBookRequest = async (req, res) => {
    try {
        const returnedBooks = await ReturnedBook.find().maxTimeMS(10000);
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


// Delete a returned book by bookId
exports.deleteReturnBookRequest = async (req, res) => {
    try {
        // Find the returned book by bookId
        const returnedBook = await ReturnedBook.findOne({ bookId: req.params.bookId });

        // If the book is not found, return a 404 error
        if (!returnedBook) {
            return res.status(404).json({ message: 'Returned book not found' });
        }

        // Delete the book
        await ReturnedBook.deleteOne({ bookId: req.params.bookId });

        // Return a success message
        res.status(200).json({ message: 'Returned book deleted' });
    } catch (error) {
        // Return a 500 error if something goes wrong
        res.status(500).json({ message: error.message });
    }
};