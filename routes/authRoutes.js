const express = require('express');
const {
    usersRegister,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    userLogin,
    requestPasswordReset,
    resetPassword,
    borrowBook,
    returnBook,
    acceptReturnBook,
    requestRenewal,
    acceptRenewal,
    getAllReturnRequests,
    getAllRenewalRequests,
    getUserCart,
    checkBorrowingEligibility,
    acceptBorrowBook,
    acceptBorrowedBookReturn
} = require('../controllers/usersController');
const { uploadBooks, allbooks, singlebook, updatebook, deletebook, getBookByStatus } = require('../controllers/bookController');
const { verifyToken } = require('../middleware/verifyToken');
const { verifyAdminToken } = require('../middleware/verifyAdminToken');
const { checkUserExists } = require('../middleware/checkUserExist');
//const {  } = require('../');
const { serialSearch } = require('../controllers/serialController');
const advanceSearchController = require('../controllers/advanceSearchController');

const router = express.Router();
//auth routes

// /api/signup
router.post('/users/register', usersRegister );
router.post('/users/login', userLogin );
router.post('/password/reset/request', requestPasswordReset);
router.patch('/password/reset/:token', resetPassword);
router.get('/admin/allusers', verifyAdminToken, getUsers );
router.get('/admin/user/:id', getUserById, verifyAdminToken );
router.put('/admin/updateuser/:id', updateUser, verifyAdminToken );
router.post('/admin/deleteuser/:id', deleteUser, verifyAdminToken );
router.post('/admin/uploadbook', verifyAdminToken,  uploadBooks);
router.get('/users/allbooks', verifyToken, allbooks );
router.get('/users/singlebook/:id', verifyToken, singlebook );
router.get('/users/:bookId/status', getBookByStatus)
router.get('/users/serialsearch', verifyToken,  serialSearch);
router.get('/users/advancesearch', verifyToken, advanceSearchController.advanceSearch);
router.put('/admin/updatebook/:id', verifyToken, updatebook);
router.delete('/admin/deletebook/:id', verifyToken, deletebook );
// Borrowing Book to user
router.post('/users/:userId/borrow', verifyToken, borrowBook);
router.get('/users/:userId/check-eligibility', verifyToken, checkBorrowingEligibility);
router.get('/users/:id/cartItems', verifyToken, getUserCart);
// Accepting Borrow Book Request from the user
router.put('/admin/accept-borrow-request/:userId/:bookId', verifyAdminToken, acceptBorrowBook);
// Accepting return Borrowed Book from the user
router.put('/admin/accept-return/:userId/:bookId', verifyAdminToken, acceptBorrowedBookReturn)
// Returning Borrowed Book Request
router.post('/users/:userId/returnBook/:bookId', verifyToken, returnBook);

router.post('admin/:userId/accept/:bookId', acceptReturnBook);
router.post('/users/:userId/renewBook/:bookId', verifyToken, requestRenewal);
router.post('/renewals/update-renewal-status', verifyAdminToken, acceptRenewal);
router.get('/admin/return-requests', getAllReturnRequests);
router.get('/admin/renewal-requests', getAllRenewalRequests);

module.exports = router;


