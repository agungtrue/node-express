const Tour = require('../models/tourModel')
const CatchAsync = require('./../utils/catchAsync');


exports.getOverview = CatchAsync(async (req, res) => {
  // 1. get some data
  const tours = await Tour.find()
  res.status(200).render('overview', {
    tours,
    user: 'haha',
    title: 'All Tours'
  })
})

exports.getBase = (req, res) => {
  res.status(200).render('base', {
    tour: 'agung',
    user: 'haha',
    title: 'Base'
  })
}