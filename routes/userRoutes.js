const express = require('express')
const router = express.Router()
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const validateJWT = require('./../middleware/validateJwt');
const { restrictTo } = require('./../middleware/protectAction');

// sample to doing authorizations/adding role
// router.post(restrictTo('user'))

// /auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', authController.updatePassword);
router.patch('/update-me', 
    userController.uploadMiddleware, 
    userController.resizeImageProccessing, 
    userController.updateMe
);

router.get('/me', userController.getMe, userController.getUser)

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(restrictTo('admin', 'lead-guide'), userController.deleteUser);


module.exports = router;