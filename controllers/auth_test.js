const express = require('express')
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserTest = require('./../models/userModel_test')
const { JWT_SECRET } = require('./../utils/keys');

exports.signup = async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 12);
        const newUser = await UserTest.create(req.body)
        res.status(201).json({ 
            status: 'success', 
            data: {
                user: newUser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
}

exports.validateSignin = (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(422).json({
            status: 'fail',
            message: 'email or password is require'
        })
    }
    next();
}

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await UserTest.findOne({email: email});
        const checkPassword = await bcrypt.compare(password, findUser.password);
        console.log(checkPassword);
        if(!checkPassword) {
            return res.status(422).json({ status: 'fail', message: 'wrong password'});
        }
        const token = jwt.sign({_id: findUser._id}, JWT_SECRET)
        const { _id, name } = findUser;
        const email_user = findUser.email;
        res.status(200).json({ 
            status: 'success', 
            token,
            user: { _id, name, email_user }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: 'please fill out email and password'
        })
    }
}

