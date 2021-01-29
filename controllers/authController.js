const User = require('./../models/userModel.js');
const { SignToken } = require('./../utils/signToken');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');


exports.signup = CatchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm, role } = req.body;
    const newUser = await User.create({name, email, password, passwordConfirm, role});

    const token = SignToken(newUser._id);
    const setCookie = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production') setCookie.secure = true;

    res.cookie('jwt', token, setCookie);

    //remove password from displayed
    newUser.password = undefined;

    const url = `${req.protocol}://${req.get('host')}/overview`
    if(process.env.NODE_ENV !== 'production') await new Email(newUser, url).sendWelcome()

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        },
        token
    })
});

exports.login = CatchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new AppError('Please provide email and password!!', 400));
    }
    
    const user = await User.findOne({email}).select('+password');
    if(!user) return next(new AppError('Incorrect email!!', 401));

    const validatePassword = await user.validatePassword(password, user.password);
    if(!validatePassword) return next(new AppError('Incorrect password!!', 401));

    const token = SignToken(user._id)

    res.status(200).json({
        status: 'success',
        token,
        user
    })
});

exports.forgotPassword = CatchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({email});
    if(!user) return next(new AppError('email not found, please check your email', 404));

    const resetPassword = user.createPasswordReset();
    await user.save({ validateBeforeSave: false });

    // const message = `forgot password? submit here: ${resetURL}`;

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetPassword}`;
        await new Email(user, resetURL).sendPasswordReset()
    
        res.status(200).json({
            status: 'success',
            message: 'token sent to email'
        });
    } 
    catch (error) {
        user.passwordReset = undefined;
        user.passwordResetExpired = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('error when sending the email', 500));
    }
    

});

exports.resetPassword = CatchAsync(async (req, res, next) => {

    const { token: requestToken } = req.params;

    //hash the token to macthing value in db
    const hashToken = crypto.createHash('sha256').update(requestToken).digest('hex');

    const user = await User.findOne({
        passwordReset: hashToken, 
        passwordResetExpired: { $gt: Date.now() }
    });

    //check token exist or not
    if(!user) return next(new AppError('token is invalid or has expired', 404));

    //new user password
    const { password, passwordConfirm } = req.body;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordReset = undefined;
    user.passwordResetExpired = undefined;

    //save new password
    await user.save();

    //send new jwt
    const token = SignToken(user._id)

    res.status(200).json({
        status: 'success',
        token
    });

});

exports.updatePassword = CatchAsync(async (req, res, next) => {
    const { _id } = req.user;
    const { currentPassword: password, newPassword, newPasswordConfirm } = req.body;

    const user = await User.findOne({_id}).select('+password');

    const validatePassword = await user.validatePassword(password, user.password);
    if(!validatePassword) return next(new AppError('your current password are not same!!', 400));

    //update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    //sign new token
    const token = SignToken(user._id)

    res.status(201).json({
        status: 'success',
        token
    });
})