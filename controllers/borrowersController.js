const BorrowedUser = require('../models/borrowedBook');
const mongoose = require('mongoose');

// Get all borrowed users
const getAllBorrowedUsers = async (req, res) => {
  try {
    const borrowedUsers = await BorrowedUser.find();
    res.json(borrowedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get borrowed user by email
const getBorrowedUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    console.log(`Fetching user data for email: ${email}`);
    const borrowedUser = await BorrowedUser.findOne({ email });

    if (borrowedUser) {
      res.json(borrowedUser);
    } else {
      res.status(404).json({ message: 'Borrowed user not found' });
    }
  } catch (error) {
    console.error(`Error fetching user by email: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get a specific borrowed user by ID
const getBorrowedUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user data by userId
    const user = await BorrowedUser.findOne({ 'cart.borrower.userId': userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single borrower by borrower ID
const getSingleBorrower = async (req, res) => {
  const { id } = req.params;
  try {
    const borrower = await BorrowedUser.findOne({ id });
    if (borrower) {
      res.json(borrower);
    } else {
      res.status(404).json({ message: 'Borrower not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Borrower By Borrower ID
const getBorrowerByBorrowerID = async (req, res) => {
  const { borrowerId } = req.params;
  try {
    const borrower = await BorrowedUser.findOne({ borrowerId });
    if (borrower) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking borrower existence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new borrowed user
const createBorrowedUser = async (req, res) => {
  const { userId, status } = req.body;
  try {
    // Find user data by userId
    const user = await BorrowedUser.findOne({ 'cart.borrower.userId': userId });

    if (user) {
      return res.status(400).json({ message: "User already exists in Borrowers" });
    }
    console.log("BorrowedUser", user);

    const existingBorrower = await BorrowedUser.findOne({ userId });

    if (existingBorrower) {
      return res.status(400).json({ message: "User already exists in Borrowers" });
    }

    const borrowedUser = new BorrowedUser(req.body);
    const newBorrowedUser = await borrowedUser.save();
    res.status(201).json(newBorrowedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a borrowed user
const updateBorrowedUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const updatedBorrowedUser = await BorrowedUser.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedBorrowedUser) {
      res.json(updatedBorrowedUser);
    } else {
      res.status(404).json({ message: 'Borrowed user not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Controller to update the return date of a book
const updateReturnDate = async (req, res) => {
  try {
    const { borrowerId, newReturnDate } = req.body;

    if (!borrowerId || !newReturnDate) {
      return res.status(400).send('Missing required fields');
    }

    const user = await BorrowedUser.findById(borrowerId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    let bookFound = false;

    user.cart = user.cart.map((item) => {
      // Assuming 'checkoutForm' exists and 'returnDate' is a property of 'checkoutForm'
      if (item.checkoutForm) {
        item.checkoutForm.returnDate = newReturnDate;
        bookFound = true;
      }
      return item;
    });

    await user.save();

    res.status(200).send('Return date updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Controller to update the status of a borrowed book
const borrowerStatusUpdate = async (req, res) => {
  const { borrowerId, bookId } = req.params;
  const { status } = req.body;

  // Validate the status value
  if (!['pending', 'accepted', 'overdue'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Find the borrower and update the status of the specified book
    const borrowerUser = await BorrowedUser.findOneAndUpdate(
      { _id: borrowerId, 'cart.book._id': bookId },
      { $set: { 'cart.$.status': status } },
      { new: true } // Return the updated document
    );

    // If the borrower or book is not found, return a 404 error
    if (!borrowerUser) {
      return res.status(404).json({ error: 'Borrower or book not found' });
    }

    // Respond with the updated borrower user
    res.status(200).json({
      message: 'Status successfully updated',
      borrowerUser
    });

  } catch (error) {
    // Handle any errors that occur during the update
    res.status(500).json({ error: 'An error occurred while updating the status' });
  }
};

// Delete a borrowed user
const deleteBorrowedUser = async (req, res) => {
  const bookId = req.params.bookId; // Assuming the book ID is passed in the request parameters

  try {
    // Find and delete the borrowed user based on the book ID
    const deletedBorrowedUser = await BorrowedUser.findOneAndDelete({ book: bookId });

    if (deletedBorrowedUser) {
      res.json({ message: 'Borrowed user deleted successfully' });
    } else {
      res.status(404).json({ message: 'Borrowed user not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a book from the cart
const deleteBookFromCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    // Find user data by userId
    const user = await BorrowedUser.findOne({ 'cart.borrower.userId': userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the book in the user's cart and remove it
    const bookIndex = user.cart.findIndex(book => book._id.toString() === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found in the cart' });
    }

    user.cart.splice(bookIndex, 1); // Remove the book from the cart

    await user.save();

    res.status(200).json({ message: 'Book removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to handle accepting borrow requests
const acceptBorrowRequests = async (req, res) => {
  const { borrowerId, bookId } = req.params;
  const { status } = req.body;

  try {
    // Find the borrower with the specified borrowerId and bookId in the cart
    const borrower = await BorrowedUser.findOneAndUpdate(
      { _id: borrowerId, 'cart.book': bookId },
      { $set: { 'cart.$.status': status } },
      { new: true }
    );
    if (!borrower) {
      return res.status(404).json({ message: 'Borrower not found' });
    }

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating status' });
  }
};

module.exports = {
  getAllBorrowedUsers,
  getBorrowedUserByEmail,
  getBorrowedUserById,
  getSingleBorrower,
  createBorrowedUser,
  updateBorrowedUser,
  updateReturnDate,
  borrowerStatusUpdate,
  deleteBookFromCart,
  deleteBorrowedUser,
  acceptBorrowRequests,
  getBorrowerByBorrowerID,
};
