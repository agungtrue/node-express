const express = require('express')
const Tour = require('./../models/tourModel')
const APIFeature = require('./../utils/apiFeatures');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactoryController.js');

//static data
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../tours.json`));
// const

// exports.checkId = (req, res, next, val) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json(
//             { 
//                 status: 'fail', 
//                 message: 'data not found!'
//             }
//         );
//     }
//     next();
// };


exports.aliasTopTour = CatchAsync(async (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'price,name,ratingsAverage'; //optional
    next();
})


exports.getAllTours = CatchAsync(async (req, res, next) => {

    // init
    const features = new APIFeature(Tour, req.query)
                        .filter()
                        .fields()
                        .sort()
                        .paginate();

    //execute query        
    const tours = await features.modelQuery;

    // analys data Object
    // const tours = await features.modelQuery.explain();


    //total data
    const total = await new APIFeature(Tour).totalData();

    //send response
    res.status(200).json(
        { 
            status: 'success',
            message: 'ok', 
            requestTime: req.requestTime,
            results: tours.length,
            total,
            data: tours
        }
    );

    // const tours = await Tour.find()
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy');
});

exports.getTour = CatchAsync(async (req, res, next) => {

    const request = req.query;
    const id = req.params.id;
    const tour = await Tour.findById(id).populate('reviews');

    if(!tour) return next(new AppError('tour not found!', 404))

    res.status(200).json(
        { 
            status: 'success', 
            data: {
                tour
            }
        }
    );
});

exports.createTour = factory.createOne(Tour);

// exports.createTour = CatchAsync(async (req, res, next) => {

    // const newTours = await Tour.create(req.body)
    //     res.status(201).json({ 
    //         status: 'success', 
    //         data: {
    //             tour: newTours
    //         }
    //     });

    // try {
        // const newTours = new Tour({})
        // newTours.save()
        // const newTours = await Tour.create(req.body)
        // res.status(201).json({ 
        //     status: 'success', 
        //     data: {
        //         tour: newTours
        //     }
        // });
    // } catch (error) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: error
    //     })
    // }

    // fs.writeFile(`${__dirname}/tours.json`, JSON.stringify(tours), err => {
    //     console.log(tours)
    // })  

// })


// exports.updateTour = CatchAsync(async (req, res, next) => {

//     const id = req.params.id;
//     const body = req.body;
//     const tour = await Tour.findByIdAndUpdate(id, body, {
//         new: true,
//         runValidators: true
//     });

//     if(!tour) {
//         return next(new AppError('id not found!', 404))
//     }

//     res.status(200).json({
//         status: 'success',
//         message: 'updated!',
//         data: {
//             tour
//         }
//     })
        
// });

//update data with dynamic document
exports.updateTour = factory.updateOne(Tour);

//delete data with dynamic document
exports.deleteTour = factory.deleteOne(Tour);


// exports.deleteTour = CatchAsync(async (req, res, next) => {

//     const id = req.params.id;
//     const tour = await Tour.findByIdAndDelete(id);

//     if(!tour) return res.status(404).json({status: 'fail', message: 'id not found!'})

//     res.status(204).json({
//         status: 'success',
//         message: 'deleted!'
//     });
    
// })

exports.getTourStats = CatchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        // {
        //     $match: { ratingsAverage: { $gte: 4.5 } }
        // },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { maxPrice: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);

    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = CatchAsync(async (req, res, next) => {

    const year = Number(req.params.year);
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: { 
                startDates: { 
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                } 
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { month: 1 }
        },
        // {
        //     $limit: 9
        // }
    ])
    //next implement paginate for aggregate request using ApiFeatures utils
    .skip(0).limit(10); 

    //next implement total data for aggregate request using ApiFeatures utils
    // here......        


    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        results: plan.length,
        data: {
            plan
        }
    });
    
});


// tours-distance/233/center/-6.35046497712636,106.92039973019018/unit/mi
// -6.35046497712636, 106.92039973019018
exports.getToursWithin = CatchAsync(async (req, res, next) => {
    const { distance, latlang, unit } = req.params;
    const [lat, lang] = latlang.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lang) next(new AppError('Please provide a lat and lang', 400))
    console.log(distance, lat, lang, unit)

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lang, lat], radius] } }
    });

    res.status(200).json({
        status: 'OK',
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = CatchAsync(async (req, res, next) => {
    const { latlang, unit } = req.params;
    const [lat, lang] = latlang.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lang) next(new AppError('Please provide a lat and lang', 400))
    console.log(lat, lang, unit)

    const distances = await Tour.aggregate([
        {
            $geoNear: { 
                near: { 
                    type: 'Point', 
                    coordinates: [lang * 1, lat * 1] 
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distances: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'OK',
        // results: tours.length,
        data: {
            data: distances
        }
    })
})
