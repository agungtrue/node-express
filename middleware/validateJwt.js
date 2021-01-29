const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./../utils/keys');
const User = require('./../models/userModel');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { promisify } = require('util');


module.exports = CatchAsync(async (req, res, next) => {
    const { authorization } = req.headers;

    //validate headers
    if(!authorization || !authorization.startsWith('Bearer ')) return next(new AppError('you are not logged in! or check your token', 401));

    //doing here if need implementation cookies
    
    //validate jwt
    const token = authorization.replace("Bearer ", "");
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //find user
    const checkUser = await User.findById(decoded.id);
    if(!checkUser) return next(new AppError('user does no longer exist!!', 401));

    //check if user already change the password
    if(checkUser.changedPasswordAfter(decoded.iat)) return next(new AppError('user recently changed the password!, please log in again', 401));
    req.user = checkUser;
    
    next();
})