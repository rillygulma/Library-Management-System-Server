const Books = require("../models/booksModels");

exports.SerialsSearch = async (req, res) => {
    try {
        const { isbn, authorName, bookTitle, bookBarcode, publisher } = req.query;
        let query = {};

        // Check if any search parameters are provided
        if (isbn || authorName || bookTitle || bookBarcode || publisher) {
            // Build the query dynamically based on provided parameters
            if (isbn) query.isbn = isbn;
            if (bookTitle) query.bookTitle = new RegExp(bookTitle, 'i');
            if (authorName) query.authorName = new RegExp(authorName, 'i');
            if (bookBarcode) query.bookBarcode = new RegExp(bookBarcode, 'i');
            if (publisher) query.publisher = new RegExp(publisher, 'i');
        }

        // Execute the query using find() method
        const books = await Books.find(query);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
