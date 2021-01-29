const express = require('express')
const fs = require('fs');
const router = express.Router()
const postController = require('./../controllers/postController')
const checkToken = require('./../middleware/checkToken')

router
    .route('/')
    .get(postController.getAllPost)
    .post(postController.createPost);

router.put('/like', checkToken, postController.like);
router.put('/unlike', checkToken, postController.unLike);
router.put('/comment', checkToken, postController.comment);

module.exports = router;