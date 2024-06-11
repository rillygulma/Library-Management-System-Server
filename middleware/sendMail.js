require('dotenv').config(); // Load environment variables from .env file

const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmailUsername,
    pass: process.env.gmailPassword
  }
});

var mailOptions = {
  from: process.env.gmailUsername,
  to: 'rilwanu.idris@fubk.edu.ng',
  subject: 'Sending Email using Node.js',
  text: 'This is email sent for forget password!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
