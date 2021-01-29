const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./../utils/keys');
const User = require('./../models/userModel');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { promisify } = require('util');


const restrictTo = (...roles) => {
    return (req, res, next) => {
    console.log('user', req.user);
        //roles ['admin', 'lead-guide']
        const user = req.user;
        if(!roles.includes(user.role)) return next(new AppError('you do not have permission to perform this action', 403));

        next();
    }
}

module.exports = {
    restrictTo
};