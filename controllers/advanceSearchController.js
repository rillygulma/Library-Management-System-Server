const Books = require('../models/booksModels');

const advanceSearch = async (req, res) => {
    try {
      const { searchBy, value } = req.query;
      // Create a dynamic query object based on the searchBy parameter
      const query = {};
      query[searchBy] = value;
      
      // Call your function to perform the advanced search
      const searchResults = await Books.find(query);
      res.status(200).json({ success: true, data: searchResults });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ success: false, message: 'Error searching for users' });
    }
  };
  
module.exports = {
    advanceSearch,
};