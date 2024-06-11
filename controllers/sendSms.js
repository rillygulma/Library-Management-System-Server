const messagingApi = require('@cmdotcom/text-sdk');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const sendSms = async (req, res) => {
    try {
        // Get the message and recipient from the request body
        const { message, recipient } = req.body;

        // Ensure the required fields are provided
        if (!message || !recipient) {
            return res.status(400).json({ error: 'Message and recipient are required' });
        }

        // Get your product token from environment variables
        const yourProductToken = process.env.CM_PRODUCT_APIKEY;
        const myMessageApi = new messagingApi.MessageApiClient(yourProductToken);

        // Send the message
        const result = await myMessageApi.sendTextMessage([recipient], 'TestSender', message);

        // Respond with the result
        res.status(200).json(result);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending the message' });
    }
};

module.exports = sendSms;
