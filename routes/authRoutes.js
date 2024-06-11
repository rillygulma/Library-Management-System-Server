const express = require('express');
const {usersRegister, userLogin, getUsers, getUserById, updateUser, deleteUser, requestPasswordReset, resetPassword } = require('../controllers/usersController');
const { uploadBooks, allbooks, singlebook, updatebook, deletebook, getBookByStatus } = require('../controllers/bookController');
const { verifyToken } = require('../middleware/verifyToken');
const { verifyAdminToken } = require('../middleware/verifyAdminToken');
//const {  } = require('../');
const { addBorrower, allBorrowers, singleBorrower, updateBorrower, deleteBorrower, getBorrowersByEmail } = require('../controllers/borrowersController');
const { renewBorrowedBook } = require('../controllers/bookRenewalController');
const { getAllSerialsSearch, SerialsSearch } = require('../controllers/serialController');
//const { sendMessage } = require('../controllers/overdueSms');
//const { sendSMS } = require('../middleware/termiiService');
const BorrowersUserController = require('../controllers/borrowersController');
const bookRenewalController = require('../controllers/bookRenewalController');
const advanceSearchController = require('../controllers/advanceSearchController');
const sendSMSController = require('../controllers/sendSms');
const {
    returnBookRequest,
    allReturnBookRequest,
    singleReturnBookRequest,
    updateReturnBookRequest,
    deleteReturnBookRequest
} = require('../controllers/returnBookController');

const router = express.Router();
//auth routes

// /api/signup
router.post('/send-sms', sendSMSController);
router.post('/users/register', usersRegister );
router.post('/users/login', userLogin );
router.get('/admin/allusers', verifyAdminToken, getUsers );
router.get('/admin/user/:id', getUserById, verifyAdminToken );
router.put('/admin/updateuser/:id', updateUser, verifyAdminToken );
router.post('/admin/deleteuser/:id', deleteUser, verifyAdminToken );
router.post('/admin/uploadbook', verifyAdminToken,  uploadBooks);
router.get('/users/allbooks', verifyToken, allbooks );
router.get('/users/singlebook/:id', verifyToken, singlebook );
router.get('/users/:bookId/status', getBookByStatus)
router.get('/users/serialsearch', verifyToken, SerialsSearch);
router.get('/users/advancesearch', verifyToken, advanceSearchController.advanceSearch);
router.put('/admin/updatebook/:id', verifyToken, updatebook);
router.delete('/admin/deletebook/:id', verifyToken, deletebook );
router.post('/users/borrowers', verifyToken, BorrowersUserController.createBorrowedUser  );
router.get('/user/allborrowers', verifyToken,  BorrowersUserController.getAllBorrowedUsers );
router.get('/admin/getBorrowerByEmail/:email', verifyToken,   BorrowersUserController.getBorrowedUserByEmail);
router.get('/users/borrowersHistory/:userId', verifyToken, BorrowersUserController.getBorrowedUserById);
//router.put('/admin/acceptborrowRequest/:borrowerId/:bookId', verifyAdminToken,  BorrowersUserController.acceptBorrowRequests);
// router.get('/singleborrowedUsers/:id', verifyToken, singleBorrower)
 router.put('/updateborrowedUsers/:id', verifyToken, BorrowersUserController.updateBorrowedUser)
 router.put('/admin/acceptborrowRequest/:borrowerId/:bookId', verifyToken, BorrowersUserController.borrowerStatusUpdate)
 router.put('/update-return-date', BorrowersUserController.updateReturnDate)
// router.delete('/deleteborrowedUsers/:id', verifyToken, deleteBorrower)
router.post('/users/renewalbookrequest', verifyToken, bookRenewalController.createBookRenewal)
router.get('/admin/allrenewalbookrequest', verifyAdminToken, bookRenewalController.getAllBookRenewals)
router.delete('/admin/acceptrenewalbookrequest/:id', verifyAdminToken, bookRenewalController.deleteBookRenewal)
// Create a returned book entry
router.post('/users/returnBookRequest', verifyToken, returnBookRequest);
// Get all returned books
router.get('/admin/allReturnsBookRequest', verifyAdminToken, allReturnBookRequest);
// Get a single returned book by ID
router.get('/singleReturnsBookRequest/:id', singleReturnBookRequest);
// Update a returned book by ID
router.put('/updateReturnsBookRequest/:id', updateReturnBookRequest);
// Delete a returned book by ID
router.delete('/admin/acceptReturnsBookRequest/:id', deleteReturnBookRequest);


//router.patch('/users/renewalborrowedBook', verifyToken, renewBorrowedBook )
//router.post('/send-sms', sendSMS )
router.post('/password/reset/request', requestPasswordReset);
router.patch('/password/reset/:token', resetPassword);







module.exports = router;


