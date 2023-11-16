const mongoose = require('mongoose')
require('dotenv').config

mongoDB = process.env.mongoDB
mongoose.connect(mongoDB).then(() =>{
    console.log('database connected')
}).catch((err) =>{
    console.log(err, 'Database connection failed')
});

mongoose.Promise = global.Promise;