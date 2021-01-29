const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const validator = require('validator');
dotenv.config({path: './config.env'});
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'a reviews must have a review'],
        trim: true,
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
        // required: [true, 'a post must have a body'],
        // trim: true,
        // unique: true
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'a reviews must have belong a Tour']
    },
    user: {
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'a reviews must have belong a User']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
},
{
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name email'
    // });

    this.populate({
        path: 'user',
        select: 'name email'
    });
    
    next();
})

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    console.log('tourId', tourId)
    const stats = await this.aggregate([
        {
            $match:  { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                numberRating: { $sum: 1 },
                avgRating: { $avg: '$rating' } 
            }
        }
    ])

    console.log('stats', stats)

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].numberRating,
        ratingsAverage: stats[0].avgRating
    });
};


reviewSchema.post('save', function() {
    // this point to current review doc
    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.q = await this.findOne()
    console.log('data', this.q)
    next();
})

reviewSchema.post(/^findOneAnd/, async function(next) {
    // await this.findOne() does NOT work here, query has already execute
    await this.q.constructor.calcAverageRatings(this.q.tour)
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;