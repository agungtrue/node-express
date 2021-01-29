const express = require('express')
const fs = require('fs');
const sharp = require('sharp');
const User = require('./../models/userModel.js');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


// need to separate into new file, and import here
//upload some image
const multer = require('multer')

//using diskStorage
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

//using memoryStorage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    console.log('file multerFilter', file)
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('not an image! Please upload only image', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

//upload single
exports.uploadMiddleware = upload.single('photo')

//upload multiple with one property name
// exports.uploadMiddleware = upload.array('photo', 3)

//upload multiple with more than one property name
// exports.uploadMiddleware = upload.fields([
//     { name: 'photo', maxCount: 1 },
//     { name:  'images', maxCount: 3 }
// ]);


//upload some image

//resize image
//upload one
exports.resizeImageProccessing = (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    console.log('file', req.file)

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
}


//upload multiple
// exports.resizeImageProccessing = CatchAsync(async (req, res, next) => {
//   if(!req.files) return next();

//   console.log('files', req.files)

//   req.files.forEach(async (file, index) => {
//       const fileName = `user-${req.user.id}-${Date.now()}-${index+1}.jpeg`

//       await sharp(file.buffer)
//           .resize(500, 500)
//           .toFormat('jpeg')
//           .jpeg({quality: 90})
//           .toFile(`public/img/users/${fileName}`);
//   });

//   next();
// })


const filterObj = (obj, allowFields) => {
    const allowObj = {};
    Object.keys(obj).forEach(el => {
        if(allowFields.includes(el)) allowObj[el] = obj[el]
    });

    return allowObj;
}


exports.getAllUsers = CatchAsync(async (req, res) => {
//  const getAllUsers = async (req, res) =>  {


    // let newArray = [];
    // for (let i = 1; i <= 20; i++) {

    //     if (i % 3 == 0) {
    //         let div3 = `Apple ${i}`;
    //         newArray.push(div3);
    //     } 
    //     else if (i % 5 == 0) {
    //         let div5 = `Orange ${i}`;
    //         newArray.push(div5);
    //     }
    //     else if (i % 5 == 0 || i % 3 == 0) {
    //         let div35 = `Apple Orange ${i}`;
    //         newArray.push(div35);
    //     }
    //     else {
    //         let text = `Looping ... number ${i}`;
    //         newArray.push(text);
    //     }

    // }

    // // result
    // newArray.map(result => console.log(result))

    // const TaskArray = [
    //     {   TaskId  :  1111, TaskName : 'Costing Sheet Renewable'}, 
    //     {   TaskId  :  2222, TaskName : 'Surveilliance'}, 
    //     {   TaskId  :  1111, TaskName : 'ReNew' }
    // ];

    // const countReNewTaskName = TaskArray.filter(task => task.TaskName == 'ReNew').length;
    // console.log('countReNewTaskName', countReNewTaskName);


    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
})

exports.createUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'not define'
    })
}

exports.updateMe = CatchAsync(async (req, res, next) => {
    console.log('file', req.file)
    console.log('body', req.body)

    if(req.body.password || req.body.newPassword || req.body.passwordConfirm) {
        return next( new AppError('this is not for updating password!!', 400) );
    }

    const currentUser  = req.user;
    const { name } = req.body;

    // if(!name) return next(new AppError('name and email is required!!', 400));
    const payloadAllowed =  filterObj(req.body, ['name', 'email']);
    if(req.file) payloadAllowed.photo = req.file.filename;

    const userEdited = await User.findByIdAndUpdate(currentUser._id, payloadAllowed, { 
        new: true,
        runValidators: true
    });

    res.status(200).json(
        { 
            status: 'success', 
            message: 'successfuly updated',
            data: userEdited
        }
    );
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    // console.log('ok', req.params);
    next()
}


exports.getUser = CatchAsync(async (req, res, next) => {

    const request = req.query;
    const id = req.params.id;
    const tour = await User.findById(id)

    if(!tour) return next(new AppError('User not found!', 404))

    res.status(200).json(
        { 
            status: 'success', 
            data: {
                tour
            }
        }
    );
});

exports.updateUser = CatchAsync(async (req, res, next) => {
    const users = await User.find();
    const { age } = req.body;
    res.status(200).json(
        { 
            status: 'success', 
            message: 'updateUser',
            data: age
        }
    );
});


exports.deleteUser = CatchAsync(async (req, res) => {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if(!user) return res.status(404).json({status: 'fail', message: 'id not found!'})

    res.status(204).json({
        status: 'success',
        message: 'deleted!'
    });
})


// module.exports = {
//   getAllUsers
// }



// Question 2
// (1)
// SELECT CategoryID, MAX(Price) FROM Products;

// (2)
// SELECT CategoryName, MAX(Price) FROM Products INNER JOIN Categories ON Categories.CategoryID = Products.CategoryID;