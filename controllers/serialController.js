const Books = require("../models/booksModels");

const serialSearch = async (req, res) => {
    try {
      const { isbn, authorName, bookTitle, bookBarcode, publisher } = req.query;
      const searchCriteria = {};
  
      if (isbn) searchCriteria.isbn = isbn;
      if (authorName) searchCriteria.authorName = new RegExp(authorName, 'i');
      if (bookTitle) searchCriteria.bookTitle = new RegExp(bookTitle, 'i');
      if (bookBarcode) searchCriteria.bookBarcode = bookBarcode;
      if (publisher) searchCriteria.publisher = new RegExp(publisher, 'i');
  
      const books = await Books.find(searchCriteria);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    serialSearch
};
