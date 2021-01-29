const express = require('express')
const viewsController = require('../controllers/viewsController')
const router = express.Router()

router.get('/', viewsController.getBase)
router.get('/overview', viewsController.getOverview)

module.exports = router