const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema with timestamps
const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        minlength: 3
    },
    wallet: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 160, 
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''  
    },
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    coin_held: [{
        coin: {
            type: Schema.Types.ObjectId,
            ref: 'Coin',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0  // Ensure quantity is non-negative
        }
    }],
    replies: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'   // Neend to verifyc
    }],
    createdCoin: [{
        type: Schema.Types.ObjectId, 
        ref: 'Coin'
    }],
    followers: [{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    likeReceived: [{
        type: Schema.Types.ObjectId, 
         ref: 'Comment'
    }],
    mentionsReceived: [{
        type: Schema.Types.ObjectId, 
         ref: 'Comment'    // Neend to verify
    }]
}, { timestamps: true }); // Enabling timestamps

// Export the model
module.exports = mongoose.model('User', UserSchema);