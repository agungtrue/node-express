const jwt = require('jsonwebtoken');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const SignToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

module.exports = {
    SignToken
}