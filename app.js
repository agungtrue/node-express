const fs = require('fs');
const express = require('express');
const path = require('path');
// import express from 'express';
const morgan = require('morgan');

//start app
const app = express();
const cookieParser = require('cookie-parser')
const compression = require('compression')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');

//router
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const userTestRouter = require('./routes/user_testRoutes')
const postRouter = require('./routes/postRoutes')
const viewRouter = require('./routes/viewRoutes')

const checkToken = require('./middleware/checkToken')
const validateJWT = require('./middleware/validateJwt');

//http security
app.use(helmet());


//middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//body parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser())

//noSql injection
app.use(mongoSanitize());

//xss injection
app.use(xss());

// remove duplicate params
app.use(hpp({ 
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));


const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'to many request from this IP, please try again in an hour!'
});



app.use('/api', limiter);
app.use('/api', validateJWT);


//checkToken is another way to check token
// app.use('/api', checkToken, (req, res, next) => {
//     //middleware
//     next();
// })

app.use(compression())

//test using middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log('cookie', req.cookies)
    next();
})


//using basic route
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//using route method
// app.route('/api/v1/tours').get(getAllTours).post(createTour);
// app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

// app.route('/api/v1/users').get(getAllUsers).post(createUsers);
// app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);


// mounting router, next move to index.Routes.js
// app.use('/api', indexRouter);
app.use('/', viewRouter);
app.use('/auth', userTestRouter)
app.use('/user', userTestRouter)
app.use('/api/v1/user', userTestRouter)

//auth user
app.use('/auth/v1/users', userRouter)

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/reviews', reviewRouter)

app.use('/ping', (req, res) => {
    res.status(200).json({status: 'success', message: 'welcome bro!'})
})


app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
})

app.use(GlobalErrorHandler)


module.exports = app;

