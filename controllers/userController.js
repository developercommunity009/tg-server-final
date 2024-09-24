
const User = require('../models/UserModel'); // Adjust the path as necessary
const catchAsync = require('../utils/catchAsync'); // Adjust the path as necessary
const AppError = require('../utils/appError'); // Adjust the path as necessary
const ApiResponse = require('../utils/apiResponse'); // Adjust the path as necessary
const { emitSocketEvent } = require('../sockets');
const { ethers } = require('ethers');


// function isValidEthereumAddress(address) {
//     return /^0x[a-fA-F0-9]{40}$/.test(address);
// }


exports.createUser = catchAsync(async (req, res, next) => {
    const {  wallet } = req.body;

    // Check if the wallet is provided
    if(!wallet) {
        return next(new AppError('Wallet is required', 400));
    }

    // Validate the wallet address using ethers.js
    if(!ethers.utils.isAddress(wallet)) {
        return next(new AppError('Invalid wallet address', 400));
    }

    // Check if a user with the wallet already exists
    const existingUser = await User.findOne({ wallet });
    if (existingUser) {
        return res.status(201).json(new ApiResponse(204, { existingUser }, 'User with this wallet already exists'))
    }

    // Create and save the new user
    const user = await User.create({ wallet });
    emitSocketEvent(req , userCreated , user )
    res.status(201).json(new ApiResponse(201, { user }, 'User created successfully'));
});

// Get user by ID
exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        // return res.status(305).json({
        //     status: 'fail',
        //     message: 'User not found'
        // });
    
        return next(new AppError('User not found',305));
    }

    res.status(200).json(new ApiResponse(200, { user }, 'User retrieved successfully'));
});

// Update user
exports.updateUser = catchAsync(async (req, res, next) => {
    const { username, bio, profilePicture } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    res.status(200).json(new ApiResponse(200, { user }, 'User updated successfully'));
});

// Delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    await user.remove();

    res.status(204).json(new ApiResponse(204, null, 'User deleted successfully'));
});


// Update profile picture
exports.updateProfileImageByWallet = catchAsync(async (req, res, next) => {
    const { wallet } = req.body;

    // Find the user by wallet
    const user = await User.findOne({ wallet });

    if (!user) {
        return next(new AppError('User not found with this wallet', 404));
    }

    // Check if the image data is present in the request
    if (!req.body.image) {
        return next(new AppError('No image uploaded', 400));
    }

    // Update the user's profile picture with the Cloudinary URL
    user.profilePicture = req.body.image.url;

    await user.save();

    res.status(200).json(new ApiResponse(200, user, 'Profile image updated successfully'));
});
