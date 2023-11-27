const mongoose = require('mongoose')
require('dotenv').config
const process = require('node:process')

mongoDB = process.env.mongoDB
mongoose.connect(mongoDB).then(() =>{
    console.log('database connected')
}).catch((err) =>{
    console.log(err, 'Database connection failed')
});

// process.on('unhandledRejection', (reason, promise) => {
//   console.log('Unhandled Rejection at:', promise, 'reason:', reason);
//   // Application specific logging, throwing an error, or other logic here
// });

// somePromise.then((res) => {
//   return reportToUser(JSON.parse(res)); // Note the typo (`parse`)
// }); // No `.catch()` or `.then()`
mongoose.Promise = global.Promise;