const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const config = process.env;

exports.verifyAdminToken = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["authorization"];
  if (!token) {
    return res.status(403).send({ success: false, message: 'No token provided. Unauthorized' });
  }

  try {
    // Split by space character and get the token part
    const bearerToken = token.split(' ')[1];
    const decodedData = jwt.verify(bearerToken, config.JWT_SECRET);
    req.user = decodedData;

    //console.log("Verified user data", decodedData.user.role);
    // Check if the user role is 'admin'
    if (decodedData.user.role !== 'admin') {
      return res.status(403).send({ success: false, message: 'You are not authorized to perform this action. Only Admin' });
    }

    next(); // Call next middleware
  } catch (err) {
    return next(err);
  }
};
