const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Coin Schema with timestamps
const CoinSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ticker: {
        type: String,
        required: true,
        trim: true,
        unique: true // Ensure ticker symbols are unique
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    chain: {
        type: String,
        required: true
    },
    telegramLink: {
        type: String,
        trim: true
    },
    twitterLink: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    holders: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        tokenQty: {
            type: Number,
            default: 0
        }
    }],
    last_trade_timestamp: {   
        type: Date,
        default: null // Use Date type for timestamps
    },
    king_of_the_hill_timestamp: {    
        type: Date,
        default: null 
    },
    usdMarketCap: {
        type: Number,
        default: 0,
        min: 0 
    },
    coinLiquidity: {
        type: Number,
        default: 2,
        min: 2
    },
    baseSupplyForPrice:{
        type: Number,
        default: 100000000,
        immutable: true // Prevents changes after the initial creation
    },
    
    
    chartData: [{
        type: Schema.Types.ObjectId,
        ref: 'ChartData'
    }],
    currentPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    currentCoinSupply: {
        type: Number,
        default: 0,
        min: 0
    },
    marketCap: {
        type: Number,
        default: 0,
        min: 0 // Ensure market cap is non-negative
    },

}, { timestamps: true });

// Create indexes for frequently queried fields
CoinSchema.index({ ticker: 1 }); // Index for ticker symbol
CoinSchema.index({ creator: 1 }); // Index for creator

// Export the model
module.exports = mongoose.model('Coin', CoinSchema);
