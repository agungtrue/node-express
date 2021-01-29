const express = require('express')
const fs = require('fs');
const { restrictTo } = require('./../middleware/protectAction');
const reviewController = require('./../controllers/reviewController')

const router = express.Router({ mergeParams: true });


// router.param('id', tourController.checkId);

//create check middleware
//check if body contains the name and price property
// if not, send back 400 (bad request)
// add it to the post handler stack

// router.route('/top-5-cheap').get(tourController.aliasTopTour, tourController.getAllTours);

// router.route('/tour-stats').get(tourController.getTourStats);
// router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(restrictTo('user'), reviewController.createReview);

router
    .route('/:id')
    .delete(reviewController.deleteReview)

// router
//     .route('/:id')
//     .get(tourController.getTour)
//     .patch(tourController.updateTour)
//     .delete(tourController.deleteTour);


module.exports = router;