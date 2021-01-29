const AppError = require("./../utils/appError");

const errorDev = (err, res) => {
    if(err._message === 'Validation failed') err.statusCode = 400;
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

const errorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        res.status(500).json({
            status: err.status,
            message: 'something went wrong!!'
        })
    }
}

const handleCastErrorDB = err => {
    const message = `invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldsdb = err => {
    const message = `duplicate field value: ${err.keyValue.name}, please use another value!`;
    return new AppError(message, 400)
}

const handleValidationErrorDb = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const handleJWTError = err => {
    if(err.name == 'TokenExpiredError') return new AppError('token expired, please log in again!!', 401)
    return new AppError('Invalid token, please log in again!!', 401)
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'erorr';

    if(process.env.NODE_ENV === 'development') {

        //run all the validate error
        errorDev(err, res);
    }
    else if (process.env.NODE_ENV === 'production') {

        let error = { ...err };

        //need to fixed
        // if(error.messageFormat === undefined) {
        //     // if(error.errors) {
        //     //     console.log('ddd')
        //     //     error =  handleCastErrorDB(error.errors.difficulty);
        //     // }
        //     error =  handleCastErrorDB(error);
        // } 

        if(error.code === 11000) error =  handleDuplicateFieldsdb(error);
        if(error._message === 'Validation failed') error = handleValidationErrorDb(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if(error.name === 'TokenExpiredError') error = handleJWTError(error);

        
        //run all the validate error
        errorProd(error, res);
    }
}