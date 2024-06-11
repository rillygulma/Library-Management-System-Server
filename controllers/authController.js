const UserStaff = require("../models/userStaffModels");
const UserStudent = require("../models/userStudentModel");
const Books = require("../models/booksModels");
const ErrorResponse = require("../utils/errorResponse");
const { ObjectId } = require('mongodb');
const borrowedBook = require("../models/borrowedBook");
const AfricasTalking = require('africastalking');

const  jwt = require('jsonwebtoken');


//SendSMS
exports.sendsms = async (req, res, next) => {
    try {
        const credentials = {
            apiKey: 'b42351486b7986be860298feec88cb5f142dc90165430e37858c96454151934b',
            username: 'sandbox',
        };
        
        const africastalking = AfricasTalking(credentials);
        
        // Access the SMS service from africastalking
        const sms = africastalking.SMS;
        const { to, message } = req.body;
        
        const options = {
            to: to,
            message: message
        };

        // Sending SMS using the sms object
        const response = await sms.send(options);
        console.log(response);
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Signup for staff
exports.staffSignup = async (req, res, next) => {
    const { email, password } = req.body;
        const userExist = await UserStaff.findOne({ email });
        
        if (userExist) {
            return next(new ErrorResponse("Email already registered", 400));        
        }
        try {
            const userStaff = await UserStaff.create(req.body);
            res.status(201).json({
                success: true, 
                userStaff
            });
        
        res.status(201).json({
            success: true, 
            token
        });
        
    } catch (error) {
        next(error);
    }
}
//signup for student
exports.studentSignup = async (req, res, next) => {
    const {email} = req.body;
    const userExist = await UserStudent.findOne({ email });
    if (userExist) {
        return next(new ErrorResponse("Email already registed", 400));        
    }
    try {
        const userStudent = await UserStudent.create(req.body);
        res.status(201).json({
            success: true, 
            userStudent
        });
        
    } catch (error) {
       next(error);
    }
}

// SignIn for staff
exports.StaffSignin = async (req, res, next) => {
        try {
            const {email, password } = req.body;
            // Validation
            if (!email) {
                return next(new ErrorResponse("Please add an email", 403));        
            }
            if (!password) {
                return next(new ErrorResponse("Please add a password", 403));
            }
            
            // Check User email
            const user = await UserStaff.findOne({ email });
            if (!user) {
                return next(new ErrorResponse("Invalid credentials", 400));               
            }
            //Check Password
            const isMatched = await user.comparePassword(password);
            jwt.sign({email: UserStaff.email, id: UserStaff._id}, process.env.JWT_SECRET, {}, (err, token) => {
                if(err) throw err;
                res.cookie("token", token).json(UserStaff)
            })
            if (!isMatched) {
                return next(new ErrorResponse("Invalid credentials", 400));               
            }

            //sendTokenResponseStaff(user, 200, res);

    } catch (error) {
        console.log('Error', error)
       next(error);
    }
}


exports.logout = async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "Logged out"
    })
}

// SignIn for student
exports.studentSignin = async (req, res, next) => {
    try {
        const {email, password } = req.body;
        // Validation
        if (!email) {
            return next(new ErrorResponse("Please add an email", 403));        
        }
        if (!password) {
            return next(new ErrorResponse("Please add a password", 403));
        }
        
        // Check User email
        const user = await UserStudent.findOne({ email });
        if (!user) {
            return next(new ErrorResponse("Invalid credentials", 400));               
        }
        //Check Password
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorResponse("Invalid credentials", 400));               
        }

        sendTokenResponseStudent(user, 200, res);

} catch (error) {
   next(error);
}
}

const sendTokenResponseStudent = async (user, codeStatus, res) => {
const token = await user.getJwtToken();
res
.status(codeStatus)
.json({success: true, token, user})
}

// Get All Staff Users
exports.allUserStaff = async (req, res, next) => {
    try {
        let users = await UserStaff.find();
        res.json(users); 
    } catch (error) {
        next(error);
    }
};

exports.userStaffId = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await UserStaff.findOne({ id: userId });

        if (!user) {
            return res.status(404).send('User not found');
        }

        req.userData = user;
        next();  
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
 // Update a Staff data patch 
 exports.updateStaff = async (req, res, next) => {
    try {
        const updateStaffData = await UserStaff.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        res.status(200).json({
            success:true,
            data: {
                user: updateStaffData
            }
        });
        
    } catch (error) {
        next(new ErrorResponse("Fail", 404));
    }
};

// Delete Staff user
exports.deleteStaff = async (req, res, next) => {
    try {
      await UserStaff.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
        next(new ErrorResponse("Fail", 404));
    }
}

// Get All Student Users
exports.allUserStudent = async (req, res, next) => {
    try {
        let users = await UserStudent.find(); 
        res.json(users); 
    } catch (error) {
        next(error);
    }
};
// Update a Student data patch 
exports.updateStudent = async (req, res, next) => {
    try {
        const updateStudentData = await UserStudent.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        res.status(200).json({
            success:true,
            data: {
                user: updateStudentData
            }
        });
        
    } catch (error) {
        next(error);
    }
};

// Delete Student user
exports.deleteStudent = async (req, res, next) => {
    try {
      await UserStudent.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
        next(new ErrorResponse("Fail", 404));
    }
};


// Upload Book
exports.uploadBooks = async (req, res, next) => {
    try {
      const newBook = new Books(req.body);
      await newBook.save();
      res.status(201).send(newBook);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };    

  // Get all books
  exports.allbooks = async (req, res, next) => {
    try {
        let books = await Books.find();
        res.json(books); 
    } catch (error) {
        next(error);
    }
};


// Find book by id
exports.singlebook = async (req, res) => {
    try {
        const book = await Books.findById(req.params.id);
        res.status(200).json({ sucess: true,
        book
        });

        if (!book) {
         res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving user' });
    }
 
  };

  // Find staff user by email
  exports.staffEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserStaff.findOne({ email });
        res.json({
            status: "success",
            data: {
             user,
            },
        });
    } catch (error) {
        console.error("Error in staffEmail:", error);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
};

// Borrowed book
exports.Borrowers = async (req, res, next) => {
    const {  bookName, isbn, borrowDate, returnDate, status } = req.body;

    try {
        // Check if the email already exists in UserStaff collection
        const userExist = await UserStaff.findOne({ email });

        if (!userExist){
            return res.status(200).json({ message: "Email Dont exists. You cannot proceed." });
        }
         console.log("Email Exist", userExist);
        // If the email is registered, create a new entry in BorrowersUser collection
        const userBorrower = await borrowedBook.create({
            email,
            phoneNo,
            bookName,
            isbn,
            borrowDate,
            returnDate
        });

        res.status(201).json({
            success: true,
            userBorrower
        });

    } catch (error) {
        next(error);
    }
};

exports.allborrowers = async (req, res, next) => {
    try {
        let user = await borrowedBook.find();
        res.json(user); 
    } catch (error) {
        next(error);
    }
};
  // Return Book
  exports.returnbook = async (req, res, next) => {
    try {
      await borrowedBook.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
        next(new ErrorResponse("Fail", 404));
    }
};
// Find book by category
// exports.bookByCategory = async (req, res, next) => {
//     let query = {};
//     if (req.query?.category) {
//         query = {category: req.query.category}
//     }
//     const result = await Books.find(query).toArray();
//     res.send(result)
// }
// Update books
exports.updateBook = async (req, res, next) => {
    const id = req.params.id;
    const updateBookInfo = req.body;
    const filter = {_id: new ObjectId({id})};
    const options ={new: true} ;

    const updateDoc = {
        $set: {
            ...updateBookInfo,
        }
         
    }

    const result = await Books.updateOne(filter, updateDoc, options );
    res.send(result)
}

// Delete book. 
exports.deleteBook = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Validate if the provided ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return next(new ErrorResponse('Invalid book ID format', 400));
        }

        const filter = { _id: new ObjectId(id) };
        const deletedBook = await Books.findByIdAndDelete(filter);

        if (!deletedBook) {
            return next(new ErrorResponse('Book not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        // Handle specific Mongoose errors
        if (error.name === 'CastError') {
            return next(new ErrorResponse('Invalid book ID format', 400));
        }

        // Handle other unexpected errors
        next(new ErrorResponse('Failed to delete book', 500));
    }
}