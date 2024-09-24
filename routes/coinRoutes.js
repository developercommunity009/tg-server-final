const express = require('express');
const router = express.Router();
const CoinController = require('../controllers/coinControllers');

router.get('/search', CoinController.searchCoins); 
router.post('/', CoinController.createCoin); // Create a new coin
router.get('/:id', CoinController.getCoin); // Get a coin by ID
router.get('/coinheld/:userId', CoinController.getCoinsByHeld); 
router.get('/coinholdres/:coinId', CoinController.getCoinsByHolders); 
router.get('/coins/:id', CoinController.getAllCoinsByUserId); // Get all coins by UserID
router.get('/hill/coins', CoinController.getHilsCoins); // Get a coin by ID
router.get('/featured/coins', CoinController.getFeaturedCoins); // Get a coin by ID
router.get('/', CoinController.getAllCoins); // Get a coin by ID
router.put('/:id', CoinController.updateCoin); // Update a coin by ID
router.delete('/:id', CoinController.deleteCoin); // Delete a coin by ID

// Buy and Sell Operations
router.post('/buy/:coinId', CoinController.buyTokens); // Buy coins
router.post('/sell/:coinId', CoinController.sellTokens); // Sell coins


module.exports = router;

