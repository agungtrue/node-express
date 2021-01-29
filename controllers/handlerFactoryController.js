const CatchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

exports.deleteOne = Model => CatchAsync(async (req, res, next) => {

    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);

    if(!doc) return res.status(404).json({status: 'fail', message: 'id not found!'})

    res.status(204).json({
        status: 'success',
        message: 'deleted!'
    });
    
});


exports.updateOne = Model => CatchAsync(async (req, res, next) => {

  const id = req.params.id;
  const body = req.body;
  const doc = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
  });

  if(!doc) {
      return next(new AppError('No document with that ID', 404))
  }

  res.status(200).json({
      status: 'success',
      message: 'updated!',
      data: {
          data: doc
      }
  })
      
});

exports.createOne = Model => CatchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body)
    res.status(201).json({ 
        status: 'success', 
        data: {
            tour: doc
        }
    });
      
});
