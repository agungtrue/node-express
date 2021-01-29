const express = require('express')
const fs = require('fs');
const Post = require('./../models/postModel')
const UserTest = require('./../models/userModel_test')


exports.getAllPost = async (req, res) => {
    try {
        let sorting = 'createdAt';
        // const postList = await Post.find().sort(sorting)
        const postList = await Post.find().sort(sorting)
        // .populate('UserTest');
        .populate('post.comments', 'name _id', UserTest);
        // .populate('comments.postedBy', '_id name', UserTest);


        res.status(200).json({ 
            status: 'success', 
            data: postList
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
}

exports.createPost = async (req, res) => {
    
    try {
        const {title, body, photo} = req.body;
        if(!title || !body || !photo) {
            return res.status(422).json({status: 'fail', message: 'Please check your request'})
        }

        const post = {title, body, photo};
        const newPost =  await Post.create(post);

        res.status(201).json({ 
            status: 'success', 
            message: 'success create post', 
            data: {
                newPost
            }
        });

    } catch (error) {
        console.log(error)
    }

}

exports.like = async (req, res, next) => {
    try {
        const { postId } = req.body;
        const { _id: userId } = req.user;
        const checkUserLike = await Post.findById(postId);

        if(checkUserLike.likes.includes(userId)) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'you already like this post'
            });
        }

        const post = await Post.findByIdAndUpdate(postId, {
            $push: { likes: req.user._id }
        }, 
        {
            new: true
        });

        res.status(200).json({ 
            status: 'success', 
            message: 'success like this post', 
            data: post
        });
        
    } catch (error) {
        console.log(error)
    }
}

exports.unLike = async (req, res, next) => {
    try {
        const { postId } = req.body;
        const { _id: userId } = req.user;
        const checkUserLike = await Post.find(
            {   
                _id: postId,
                likes: { $elemMatch: { $eq:  userId}}
            }
        );

        if (checkUserLike.length == 0) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'you already unlike this post'
            });
        }
        const post = await Post.findByIdAndUpdate(postId, {
            $pull: {likes: req.user._id}
        }, 
        {
            new: true
        });
        
        res.status(200).json({ 
            status: 'success', 
            message: 'success unlike this post', 
            data: post
        });
        
    } catch (error) {
        console.log(error)
    }
}

exports.comment = async (req, res, next) => {
    try {
        const { postId, text } = req.body;
        const postedBy = req.user_id;

        const newComment = {
            text,
            postedBy
        };

        const post = await Post.findByIdAndUpdate(postId, {
            $push: { comments: newComment }
        }, 
        {
            new: true
        })
        .populate('comments.postedBy', '_id name');
        // .populate('UserTest', '_id name');


        res.status(200).json({ 
            status: 'success', 
            message: 'comment this post', 
            data: post
        });
        
    } catch (error) {
        console.log(error)
    }
}

