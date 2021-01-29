const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const validator = require('validator');
const UserTest = require('./userModel_test');
dotenv.config({path: './config.env'});

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'a post must have a title'],
        trim: true,
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    body: {
        type: String,
        required: [true, 'a post must have a body'],
        trim: true,
        unique: true
    },
    photo: {
        type: String,
        trim: true,
        required: [true, 'a post must have a photo']
    },
    likes: {
        type: Array,
        ref: 'User'
    },
    comments: [
        {
            text: String,
            postedBy: {
                type: mongoose.Schema.ObjectId,
                ref: 'UserTest'
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;