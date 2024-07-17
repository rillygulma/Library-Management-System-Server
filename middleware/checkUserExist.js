const BorrowedUser = require('../models/borrowedBook');

const checkUserExists = async (req, res, next) => {
    try {
      const userId = req.params.userId;
  
      // Find user data by userId
      const user = await BorrowedUser.findOne({ 'cart.borrower.userId': userId });
  
      if (user) {
        return res.status(400).json({ message: 'Yes User already exists' });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  module.exports = { checkUserExists };