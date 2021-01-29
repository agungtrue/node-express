const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel')
dotenv.config({path: './config.env'});

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'a tour name must have a 40 characters'],
        minlength: [10, 'a tour name must have a 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'a tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'a tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'a tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'a tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: 'discount price ({VALUE}) should be below regular price',
            validator: function(val) {
                // its only for current document to new document creation
                return val < this.price;
            }
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'a tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'a tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    location: [
        {
            type: String,
            default: 'Point',
            enum: ['Point'],
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type : mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
    // reviews: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// adding indexing object data
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ startLocation: '2dsphere' })
// tourSchema.index({ coordinates: '2dsphere' })


tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//document middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

// tourSchema.pre('save', async function(next) {
//     const giudesPromise = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(giudesPromise);
//     next();
// });

// tourSchema.pre('save', function(next) {
//     console.log(this);
//     next();
// });

// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

//query middleware
tourSchema.pre(/^find/, function(next) {
    //not showing for some key to client
    this.find({ secretTour: {$ne: true} });
    // this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    
    next();
})

tourSchema.post(/^find/,  function(docs, next) {
    // console.log(`query time ${Date.now() - this.start} milliseconds`)
    next();
});


// agrgregation middleware
// tourSchema.pre('aggregate', function(next) {
//     // not showing for some key to client using aggregate query
//     this.pipeline().unshift({
//         $match: { secretTour: { $ne: true } }
//     });
//     // console.log(this.pipeline())
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;