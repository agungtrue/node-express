const express = require('express')
const fs = require('fs');
const router = express.Router()
const userTestController = require('./../controllers/auth_test')

router
    .route('/signup')
    .post(userTestController.signup);

router
    .route('/sign-in')
    .post(userTestController.validateSignin, userTestController.signin)


module.exports = router;