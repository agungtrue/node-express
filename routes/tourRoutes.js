const express = require('express')
const fs = require('fs');
const router = express.Router()
const tourController = require('./../controllers/tourController')
// const reviewController = require('./../controllers/reviewController')
const { restrictTo } = require('./../middleware/protectAction');

const reviewRouter = require('./../routes/reviewRoutes');


// router.param('id', tourController.checkId);

//create check middleware
//check if body contains the name and price property
// if not, send back 400 (bad request)
// add it to the post handler stack

router.route('/top-5-cheap').get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

router.route('/tour-within/:distance/center/:latlang/unit/:unit').get(tourController.getToursWithin)
router.route('/distances/:latlang/unit/:unit').get(tourController.getDistances)


router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(restrictTo('admin'), tourController.deleteTour);

//get review from tour 
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;