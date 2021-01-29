const express = require('express')
const fs = require('fs');
const Review = require('./../models/reviewsModel.js');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactoryController.js');


const filterObj = (obj, allowFields) => {
    const allowObj = {};
    Object.keys(obj).forEach(el => {
        if(allowFields.includes(el)) allowObj[el] = obj[el]
    });

    return allowObj;
}

exports.getAllReviews = CatchAsync(async (req, res) => {

    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };

    const review = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})

exports.createReview = CatchAsync(async (req, res) => {

    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user._id;

    const { review, rating, tour } = req.body;
    const user = req.user._id;
    const payload = { user, review, rating, tour };

    const newReview = await Review.create(payload);

    res.status(201).json({
        status: 'success',
        message: 'already create new review',
        data: newReview
    });
})

exports.deleteReview = factory.deleteOne(Review);


// exports.getUser = CatchAsync(async (req, res, next) => {

//     const request = req.query;
//     const id = req.params.id;
//     const tour = await User.findById(id)

//     if(!tour) return next(new AppError('User not found!', 404))

//     res.status(200).json(
//         { 
//             status: 'success', 
//             data: {
//                 tour
//             }
//         }
//     );
// });

// exports.updateUser = CatchAsync(async (req, res, next) => {
//     const users = await User.find();
//     const { age } = req.body;
//     res.status(200).json(
//         { 
//             status: 'success', 
//             message: 'updateUser',
//             data: age
//         }
//     );
// });


// exports.deleteUser = CatchAsync(async (req, res) => {
//     const id = req.params.id;
//     const user = await User.findByIdAndDelete(id);

//     if(!user) return res.status(404).json({status: 'fail', message: 'id not found!'})

//     res.status(204).json({
//         status: 'success',
//         message: 'deleted!'
//     });
// })



// Question 2
// (1)
// SELECT CategoryID, MAX(Price) FROM Products;

// (2)
// SELECT CategoryName, MAX(Price) FROM Products INNER JOIN Categories ON Categories.CategoryID = Products.CategoryID;