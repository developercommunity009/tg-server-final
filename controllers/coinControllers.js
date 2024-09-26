const Coin = require('../models/CoinModel');
const Transaction = require('../models/TransactionModel');
const ChartData = require('../models/ChartDataModel');
const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync'); // Adjust the path as necessary
const AppError = require('../utils/appError'); // Adjust the path as necessary
const ApiResponse = require('../utils/apiResponse'); // Adjust the path as necessary
const { emitSocketEvent } = require('../sockets');
const APIFeatures = require('../utils/apiFeatures');
const axios = require('axios');





// Create a new coin
exports.createCoin = catchAsync(async (req, res, next) => {
    const { name, ticker, description, image, chain, creatorWallet } = req.body;
  
    // Check for required fields
    if (!name || !ticker || !description || !image || !chain) {
      return next(new AppError('All fields (name, ticker, description, image, chain) are required', 400));
    }
  
    if (!creatorWallet) {
      return next(new AppError('Creator wallet address is required', 400));
    }
  
    // Create new coin
    const newCoin = await Coin.create(req.body);
  
    // Emit socket event for the new coin
    emitSocketEvent(req, "newCoinCreated", newCoin);
  
    // Send success response
    res.status(201).json(new ApiResponse(201, { coin: newCoin }, 'Coin created successfully'));
  });
  

exports.searchCoins = catchAsync(async (req, res) => {
    
    try {
        const { query } = req.query; // Get the search query from the request

        if (!query) {
            return next(new AppError('Query parameter is required', 400));
        }

        // Perform search across multiple fields using $or
        const coins = await Coin.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },            // Search by coin name
                { ticker: { $regex: query, $options: 'i' } },          // Search by ticker symbol
                { description: { $regex: query, $options: 'i' } },     // Search by description
                { chain: { $regex: query, $options: 'i' } },           // Search by blockchain chain
                { telegramLink: { $regex: query, $options: 'i' } },    // Search by Telegram link
                { twitterLink: { $regex: query, $options: 'i' } },     // Search by Twitter link
                { website: { $regex: query, $options: 'i' } },         // Search by website
                { 'creator.name': { $regex: query, $options: 'i' } },  // Search by creator's name (optional if using populate)
            ]
        }).populate('creator'); // Populate creator's name


           res.status(200).json(new ApiResponse(201, coins, 'Coin get successfully'));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Get a coin by ID
exports.getCoin = catchAsync(async (req, res, next) => {
    const coin = await Coin.findById(req.params.id).populate('chartData');
    if (!coin) return next(new AppError('Coin not found', 404));

    res.status(200).json(new ApiResponse(200, { coin }, 'Coin retrieved successfully'));
});

// Get all coins
exports.getAllCoins = catchAsync(async (req, res, next) => {
    // Exclude coins with usdMarketCap equal to or greater than 69000
    const features = new APIFeatures(
        Coin.find({ usdMarketCap: { $lt: 69000 } }).populate('creator'), 
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const coins = await features.query;

    if (!coins.length) return next(new AppError('Coins not found', 404));

    res.status(200).json(new ApiResponse(200, { coins }, 'Coins retrieved successfully'));
});

// Get Hils coins
exports.getHilsCoins = catchAsync(async (req, res, next) => {
    // Only show coins with usdMarketCap equal to or greater than 69000
    const features = new APIFeatures(
        Coin.find({ usdMarketCap: { $gte: 69000 } }).populate('creator'), 
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const coins = await features.query;

    if (!coins.length) return next(new AppError('Coins not found', 404));

    res.status(200).json(new ApiResponse(200, { coins }, 'Coins retrieved successfully'));
});
// Get Featurs coins
exports.getFeaturedCoins = catchAsync(async (req, res, next) => {
    // Only show coins with usdMarketCap equal to or greater than 69000
    // const coins = await Coin.find({ usdMarketCap: { $gte: 30000 } });
    const features = new APIFeatures(
        Coin.find({    usdMarketCap: { 
            $gte: 30000, // Greater than or equal to 30000
            $lt: 69000   // Less than 69000
        }  }).populate('creator'), 
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const coins = await features.query;

    if (!coins.length) return next(new AppError('Coins not found', 404));

    res.status(200).json(new ApiResponse(203, { coins }, 'Coins retrieved successfully'));
});

// Get all coins by userID
exports.getAllCoinsByUserId = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Check if id is provided
    if (!id) {
        return next(new AppError('User ID is required', 400));
    }
    console.log(id);
    // Find all coins by user ID
    const coins = await Coin.find({ creator: id }).populate("creator");

    // If no coins found, return error
    if (!coins || coins.length === 0) {
        return next(new AppError('Coins not found', 404));
    }

    // Return the found coins
    res.status(200).json(new ApiResponse(200, { coins }, 'Coins retrieved successfully'));
});

// Get all coins by WalletAddress
exports.getAllCoinsByUserWallet = catchAsync(async (req, res, next) => {
    const { address } = req.params;

    // Check if id is provided
    if (!address) {
        return next(new AppError('User Wallet  required', 400));
    }
    
    // Find all coins by user ID
    const coins = await Coin.find({ creatorWallet: address })
    // .populate("creator");

    // If no coins found, return error
    if (!coins || coins.length === 0) {
        return next(new AppError('Coins not found', 404));
    }

    // Return the found coins
    res.status(200).json(new ApiResponse(200, { coins }, 'Coins retrieved successfully'));
});

// Get all coins holdres
exports.getCoinsByHolders = catchAsync(async (req, res, next) => {
    const { coinId } = req.params; // Get the coinId from the request parameters

    // Check if coinId is provided
    if (!coinId) {
        return next(new AppError('Coin ID is required', 400));
    }

    // Find the coin by ID and populate the 'holders.user' field to get the user details
    const coin = await Coin.findById(coinId)
        .populate({
            path: 'holders.user', // Populate the 'user' field inside 'holders'
            select: 'profilePicture wallet' // Adjust fields as needed
        });

    // If coin is not found, return an error
    if (!coin) {
        return next(new AppError('Coin not found', 404));
    }

    // Extract and format only the holders' information
    const holders = coin.holders.map(holder => ({
        user: holder.user, // Includes user details (name, email)
        tokenQty: holder.tokenQty // The quantity of tokens the user holds
    }));

    // Return only the holders array
    res.status(200).json(new ApiResponse(200, { holders }, 'Holders retrieved successfully'));

});
// Get all coins held by a user with their quantities
exports.getCoinsByHeld = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    // Check if userId is provided
    if (!userId) {
        return next(new AppError('User ID is required', 400));
    }

    // Find the user by ID and populate the coin details
    const user = await User.findById(userId).populate('coin_held.coin');

    // If user is not found, return an error
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // If user has no coins, return an appropriate response
    if (!user.coin_held || user.coin_held.length === 0) {
        return res.status(200).json(new ApiResponse(200, { coins: [] }, 'No coins found for this user'));
    }

    // Format the response to include coin details and quantities
    const coinsWithQuantities = user.coin_held.map(holding => ({
        coin: holding.coin,
        quantity: holding.quantity
    }));

    // Return the found coins with their quantities
    res.status(200).json(new ApiResponse(200, { coins: coinsWithQuantities }, 'Coins retrieved successfully'));
});


// Update a coin by ID
exports.updateCoin = catchAsync(async (req, res, next) => {
    const { name, totalSupply, ticker, description, image, chain, hidden, usd_market_cap } = req.body;

    const updatedCoin = await Coin.findByIdAndUpdate(req.params.id, {
        name,
        totalSupply,
        ticker,
        description,
        image,
        chain,
        hidden,
        usd_market_cap
    }, { new: true });

    if (!updatedCoin) return next(new AppError('Coin not found', 404));

    res.status(200).json(new ApiResponse(200, { coin: updatedCoin }, 'Coin updated successfully'));
});

// Delete a coin by ID
exports.deleteCoin = catchAsync(async (req, res, next) => {
    const deletedCoin = await Coin.findByIdAndDelete(req.params.id);
    if (!deletedCoin) return next(new AppError('Coin not found', 404));

    res.status(200).json(new ApiResponse(200, { coin: deletedCoin }, 'Coin deleted successfully'));
});


exports.buyTokens = catchAsync(async (req, res, next) => {
    const { coinId } = req.params;
    const { amount, userId } = req.body;

    // Validation for input data
    if (!coinId || !amount || !userId) {
        return next(new AppError('Coin ID, amount, and user ID are required', 400));
    }

    // Fetch coin and user details
    const coin = await Coin.findById(coinId);
    if (!coin) {
        return next(new AppError('Coin not found', 404));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Fetch real-time price data
    let priceData;
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'binancecoin,ethereum,matic-network',
                vs_currencies: 'usd',
            }
        });
        priceData = response.data;
    } catch (error) {
        return next(new AppError('Failed to fetch real-time price data', 500));
    }

    // Determine the USD value based on the coin's chain
    let usdValue;
    switch (coin.chain.toLowerCase()) {
        case 'bsc':
            usdValue = priceData?.binancecoin?.usd;
            break;
        case 'ethereum':
            usdValue = priceData?.ethereum?.usd;
            break;
        case 'matic':
            usdValue = priceData['matic-network']?.usd;
            break;
        default:
            return next(new AppError('Unsupported chain', 400));
    }

    if (!usdValue) {
        return next(new AppError('Price data for the chain is missing', 500));
    }

    // Calculate the USDT value and the number of tokens being bought
    const usdtAmount = amount * usdValue;

    // Check if this is the first buy
    let currentPrice;
    if (coin.currentCoinSupply === 0) {
        // If this is the first buy, set the price using coinLiquidity / baseSupplyForPrice
        currentPrice = coin.coinLiquidity / coin.baseSupplyForPrice;
    } else {
        // If not the first buy, use the existing price
        currentPrice = coin.currentPrice;
    }

    const buyedTokenQty = usdtAmount / currentPrice;
    const newTotalSupplyOfCoin = coin.currentCoinSupply + buyedTokenQty;

    // Update coin's liquidity and price
    coin.coinLiquidity += usdtAmount; // Add USD amount to liquidity
    coin.currentPrice = coin.coinLiquidity / coin.baseSupplyForPrice;
    // Update total supply and market cap
    coin.currentCoinSupply = newTotalSupplyOfCoin;
    coin.usdMarketCap = coin.coinLiquidity - 2; // Update the USD market cap

    // Update or add holder's token quantity
    console.log(userId);
    const holder = coin.holders.find(h => h.user.toString() === userId.toString());
    if (holder) {
        holder.tokenQty += buyedTokenQty;
    } else {
        coin.holders.push({ user: userId, tokenQty: buyedTokenQty });
    }

    // Save the updated coin
    await coin.save();

    // Update user's coin holdings
    const userCoin = user.coin_held.find(c => c.coin.toString() === coinId);
    if (userCoin) {
        userCoin.quantity += buyedTokenQty;
    } else {
        user.coin_held.push({ coin: coinId, quantity: buyedTokenQty });
    }
    await user.save();

    // Create a transaction for the buy
    const trxn = await Transaction.create({
        coin: coinId,
        user: userId,
        amount,
        tokenQuantity: buyedTokenQty,
        type: 'buy',
        price: coin.currentPrice,
    });

    // Create chart data entry
    await ChartData.create({
        coin: coinId,
        price: coin.currentPrice,
        totalSupply: newTotalSupplyOfCoin,
        timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    });

    // Emit a socket event
    emitSocketEvent(req, 'tradeBuy',  trxn );

    // Send response
    res.status(200).json(new ApiResponse(200, { coin }, 'Token bought successfully'));
});



exports.sellTokens = catchAsync(async (req, res, next) => {
    const { coinId } = req.params;
    const { amount, userId } = req.body;

    // Validate input data
    if (!coinId || !amount || !userId) {
        return next(new AppError('Coin ID, amount, and user ID are required', 400));
    }

    // Fetch coin and user details
    const coin = await Coin.findById(coinId);
    if (!coin) {
        return next(new AppError('Coin not found', 404));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Fetch real-time price data
    let priceData;
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'binancecoin,ethereum,matic-network',
                vs_currencies: 'usd',
            }
        });
        priceData = response.data;
    } catch (error) {
        return next(new AppError('Failed to fetch real-time price data', 500));
    }

    // Determine USD value based on the chain
    let usdValue;
    switch (coin.chain.toLowerCase()) {
        case 'bsc':
            usdValue = priceData?.binancecoin?.usd;
            break;
        case 'ethereum':
            usdValue = priceData?.ethereum?.usd;
            break;
        case 'matic':
            usdValue = priceData['matic-network']?.usd;
            break;
        default:
            return next(new AppError('Unsupported chain', 400));
    }

    if (!usdValue) {
        return next(new AppError('Price data for the chain is missing', 500));
    }

    // Calculate the token quantity being sold
    const usdtAmountQty = amount * usdValue;
    const sellTokenQty = usdtAmountQty / coin.currentPrice;

    // Validate user's holdings
    const userCoin = user.coin_held.find(c => c.coin.toString() === coinId);
    

    if (!userCoin || userCoin.quantity <= sellTokenQty) {
        return next(new AppError('Not enough tokens to sell', 402));
    }

    // Update Coin values: Liquidity, Supply, Price, Market Cap
    coin.coinLiquidity -= usdtAmountQty;
    coin.currentCoinSupply -= sellTokenQty;
    coin.currentPrice = coin.coinLiquidity / coin.baseSupplyForPrice;
    coin.usdMarketCap = coin.coinLiquidity - 2;

    // Update user's token holdings
    userCoin.quantity -= sellTokenQty;
    if (userCoin.quantity === 0) {
        user.coin_held = user.coin_held.filter(c => c.coin.toString() !== coinId);
    }
    await user.save();

    // Update holders array
    const holder = coin.holders.find(h => h.user.toString() === userId.toString());
    if (holder) {
        holder.tokenQty -= sellTokenQty;
        if (holder.tokenQty <= 0) {
            coin.holders = coin.holders.filter(h => h.user.toString() !== userId.toString());
        }
    }
    await coin.save();

    // Log transaction
    const trxn = await Transaction.create({
        coin: coinId,
        user: userId,
        amount,
        tokenQuantity: sellTokenQty,
        type: 'sell',
        price: coin.currentPrice,
    });

    emitSocketEvent(req, 'tradeSell',  trxn );
    // Send response
    res.status(200).json(new ApiResponse(200, { coin }, 'Token sold successfully'));
});




