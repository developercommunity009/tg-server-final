
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const Admin = require('../models/AdminModel');

    exports.checkAdmin = async (req, res, next) => {
        try {
            const token = req.header("Authorization")?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ error: "Access denied, no token provided" });
            }
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findById(decoded.id).select("-password");
    
            if (!admin) {
                return res.status(401).json({ error: "Admin not found" });
            }
    
            req.user = admin; // Attach admin details to req.user
            next();
        } catch (error) {
            res.status(401).json({ error: "Invalid token" });
        }
    };


// Middleware to verify JWT token
exports.protect = (req, res, next) => {
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError('Not authenticated', 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError('Invalid token', 401));
    }
};

// Middleware to check admin role
exports.checkAdmin = (req, res, next) => {
    if (req.user?.role !== 'Admin') {
        return next(new AppError('Access denied. Only admin can perform this action', 403));
    }
    next();
};


// Middleware to check patient role
exports.checkEmbryologist = (req, res, next) => {
    if (req.user?.speciality !== 'Embryologist') {
        return next(new AppError('Access denied. Only Embryologist can perform this action', 403));
    }
    next();
};

// Middleware to check doctor role
exports.checkFertility = (req, res, next) => {
    if (req.user?.speciality !== 'Fertility Specialist') {
        return next(new AppError('Access denied. Only Fertility Specialist can perform this action', 403));
    }
    next();
};
