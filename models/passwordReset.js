const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({    
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true
    },
});

module.exports = mongoose.model('passwordReset', PasswordResetSchema);