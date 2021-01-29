const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const validator = require('validator');
dotenv.config({path: './config.env'});

const user_testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a user must have a name'],
        trim: true,
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    email: {
        type: String,
        required: [true, 'a user must have a email'],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'a user must have a password']
    },
    slug: String
});

user_testSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

const User = mongoose.model('UserTest', user_testSchema);

module.exports = User;