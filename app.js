const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const request = require('request');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Database connection
mongoose.connect(process.env.DATABASE, {})
  .then(() => console.log('Connected to database'))
  .catch((error) => console.log(error));
  
  mongoose.set('bufferCommands', false);
// MIDDLEWARE
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: false
}));
app.use(cookieParser());
app.use(cors());

// Import GoogleGenerativeAI module
const { GoogleGenerativeAI } = require('@google/generative-ai');

const googleAI = new GoogleGenerativeAI(process.env.Gemini_ApiKey);

const fubkAi = async (req, res) => {
  try {
    const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: req.body.history,
    });

    const msg = req.body.message;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while processing your request.' });
  }
};

app.post('/api/fubk-ai', fubkAi);

// Termii SMS Setup
app.post('/send-sms', (req, res) => {
  const { to, from, sms, type, api_key, channel, media } = req.body;

  // Create the data object for the SMS
  const data = {
      to: to || "+2348035504017",
      from: from || "talert",
      sms: sms || "Hi there, testing Termii",
      type: type || "plain",
      api_key: api_key || "Your API key",  // Ensure this is correctly set
      channel: channel || "generic",
      media: media || {
          url: "https://media.example.com/file",
          caption: "your media file"
      }
  };

  // Options for the request
  const options = {
      method: 'POST',
      url: 'https://api.ng.termii.com/api/sms/send', // Replace with actual API URL
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  };

  // Make the request to send the SMS
  request(options, (error, response) => {
      if (error) {
          console.error(error);
          return res.status(500).send('An error occurred while sending the SMS');
      }

      if (response.statusCode === 401) {
          return res.status(401).send('Unauthorized: Invalid API key or authentication credentials');
      }

      console.log(response.body);
      res.status(200).send(response.body);
  });
});



app.use('/api', authRoutes);

// Error middleware
app.use(errorHandler);

// Port
const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Server running on port ${port}!`));
