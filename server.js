const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

// process.on('uncaughtException', err => {
//     console.log(err.name, err.message)
//     console.log('Uncaught Exception!!!')
//     process.exit(1);
// })

const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>', 
    process.env.DATABASE_PASSWORD
);

// const DB = process.env.DATABASE_LOCAL;

mongoose
    .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
}).then(con => console.log('DB already connection successful!'));


const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`running on port ${port}`)
});


process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('Unhandled Rejection, please check connection db!!!')
    server.close(() => {
        process.exit(1);
    });
});

//terminate process by SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully')
    server.close(() => {
        console.log('procces terminated!')
    })
})
